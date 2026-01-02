import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Arti Studio</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950/30 to-slate-950 p-4">
        <div className="text-center max-w-md mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="relative mb-8"
          >
            {/* Glowing background */}
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full" />

            {/* 404 Number */}
            <h1 className="relative text-[120px] md:text-[150px] font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 leading-none">
              404
            </h1>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-violet-400" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-3">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              The page you're looking for doesn't exist or has been moved
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
            >
              <Home className="w-5 h-5" />
              Home Page
            </button>
          </motion.div>

          {/* Search suggestion */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-10 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Or try searching for what you need
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-white/20 transition-colors text-sm"
            >
              <Search className="w-4 h-4" />
              Search gallery...
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
