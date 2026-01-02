-- إصلاح نهائي لصلاحيات التعديل للمستخدمين العاديين والأدمن
-- هذا الكود يضمن أن:
-- 1. المستخدم العادي يستطيع تعديل بروفايله الخاص دائماً
-- 2. الأدمن يستطيع تعديل أي بروفايل
-- 3. لا يحدث تضارب (Recursion)

-- أولاً: حذف السياسات القديمة المتضاربة للتنظيف
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- ثانياً: إنشاء سياسة موحدة للتحديث (Update Policy)
-- تسمح بالتعديل في حالتين:
-- 1. المستخدم هو صاحب الحساب (id = auth.uid())
-- 2. المستخدم هو أدمن (باستخدام الدالة الآمنة is_admin)

CREATE POLICY "Enable update for users based on id or admin status"
ON profiles
FOR UPDATE
USING (
  auth.uid()::text = id  -- المستخدم يعدل نفسه
  OR
  is_admin()             -- الأدمن يعدل أي حد
)
WITH CHECK (
  auth.uid()::text = id  -- تأكيد إضافي (اختياري لكن مفيد للأمان)
  OR
  is_admin()
);
