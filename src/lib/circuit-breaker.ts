/**
 * Circuit Breaker Pattern for External Service Calls
 * 
 * Prevents cascade failures when external services (Supabase, Firebase, R2) are slow or down.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, reject requests immediately
 * - HALF_OPEN: Testing if service recovered
 * 
 * Use cases:
 * - Supabase DB queries
 * - Firebase auth calls
 * - Cloudflare Worker uploads
 */

interface CircuitBreakerConfig {
    failureThreshold: number;    // Number of failures before opening
    successThreshold: number;    // Number of successes in half-open to close
    timeout: number;             // Time to wait before trying again (ms)
    requestTimeout: number;      // Timeout for individual requests (ms)
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerState {
    state: CircuitState;
    failures: number;
    successes: number;
    lastFailure: number;
    nextAttempt: number;
}

const circuits = new Map<string, CircuitBreakerState>();

// Default configurations for different services
export const CIRCUIT_CONFIGS = {
    // Database - more tolerant, higher timeout
    database: {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 30000,      // 30 seconds before retry
        requestTimeout: 10000, // 10 second request timeout
    },

    // Auth - less tolerant of failures
    auth: {
        failureThreshold: 3,
        successThreshold: 1,
        timeout: 60000,      // 1 minute before retry
        requestTimeout: 5000, // 5 second request timeout
    },

    // External APIs (R2, Workers)
    external: {
        failureThreshold: 3,
        successThreshold: 2,
        timeout: 45000,      // 45 seconds before retry
        requestTimeout: 15000, // 15 second request timeout
    },
} as const;

function getCircuit(name: string): CircuitBreakerState {
    let circuit = circuits.get(name);
    if (!circuit) {
        circuit = {
            state: 'CLOSED',
            failures: 0,
            successes: 0,
            lastFailure: 0,
            nextAttempt: 0,
        };
        circuits.set(name, circuit);
    }
    return circuit;
}

/**
 * Execute a function with circuit breaker protection
 * 
 * @param name - Circuit breaker name (e.g., 'supabase:gallery')
 * @param fn - Async function to execute
 * @param fallback - Fallback value if circuit is open
 * @param config - Circuit breaker configuration
 */
export async function withCircuitBreaker<T>(
    name: string,
    fn: () => Promise<T>,
    fallback: T,
    config: CircuitBreakerConfig = CIRCUIT_CONFIGS.database
): Promise<T> {
    const circuit = getCircuit(name);
    const now = Date.now();

    // Check if circuit is open
    if (circuit.state === 'OPEN') {
        if (now >= circuit.nextAttempt) {
            // Try to transition to half-open
            circuit.state = 'HALF_OPEN';
            circuit.successes = 0;
        } else {
            // Still open - return fallback immediately
            console.warn(`Circuit breaker OPEN for ${name}, using fallback`);
            return fallback;
        }
    }

    try {
        // Execute with timeout
        const result = await withTimeout(fn(), config.requestTimeout);

        // Record success
        if (circuit.state === 'HALF_OPEN') {
            circuit.successes++;
            if (circuit.successes >= config.successThreshold) {
                // Recovered - close the circuit
                circuit.state = 'CLOSED';
                circuit.failures = 0;
                console.log(`Circuit breaker CLOSED for ${name} - service recovered`);
            }
        } else if (circuit.state === 'CLOSED') {
            // Reset failure count on success
            circuit.failures = 0;
        }

        return result;

    } catch (error) {
        // Record failure
        circuit.failures++;
        circuit.lastFailure = now;

        if (circuit.state === 'HALF_OPEN') {
            // Failure in half-open - back to open
            circuit.state = 'OPEN';
            circuit.nextAttempt = now + config.timeout;
            console.warn(`Circuit breaker OPEN for ${name} - half-open test failed`);
        } else if (circuit.failures >= config.failureThreshold) {
            // Too many failures - open the circuit
            circuit.state = 'OPEN';
            circuit.nextAttempt = now + config.timeout;
            console.warn(`Circuit breaker OPEN for ${name} - threshold exceeded`);
        }

        // Log the error but return fallback
        console.error(`Circuit breaker error for ${name}:`, error);
        return fallback;
    }
}

/**
 * Wrap a promise with a timeout
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
        ),
    ]);
}

/**
 * Get the current state of a circuit breaker
 */
export function getCircuitState(name: string): CircuitState {
    return getCircuit(name).state;
}

/**
 * Manually reset a circuit breaker
 */
export function resetCircuit(name: string): void {
    const circuit = getCircuit(name);
    circuit.state = 'CLOSED';
    circuit.failures = 0;
    circuit.successes = 0;
    console.log(`Circuit breaker manually reset for ${name}`);
}

/**
 * Get all circuit breaker states (for debugging/monitoring)
 */
export function getAllCircuitStates(): Record<string, CircuitState> {
    const states: Record<string, CircuitState> = {};
    for (const [name, circuit] of circuits.entries()) {
        states[name] = circuit.state;
    }
    return states;
}
