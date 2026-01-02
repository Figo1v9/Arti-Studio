-- ⚠️ هام: قم بتشغيل هذا الكود في Supabase SQL Editor لإصلاح مشكلة صلاحيات الأدمن

-- 1. السماح للأدمن بتعديل أي بروفايل (Admins can update any profile)
-- هذا سيحل مشكلة الـ 401 عند محاولة تغيير الشارات أو الـ Premium
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()::text) = 'admin'
);

-- 2. السماح للأدمن برؤية جميع البروفايلات (Admins can view all profiles)
-- هذا ضروري لكي يظهر المستخدمون الـ Private في لوحة التحكم
CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()::text) = 'admin'
);
