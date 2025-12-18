export const GRADE_LEVELS = [
  { label: 'Kindergarten', value: 'Kinder', requiresParent: true },
  { label: 'Grade 1', value: 'Grade 1', requiresParent: true },
  { label: 'Grade 2', value: 'Grade 2', requiresParent: true },
  { label: 'Grade 3', value: 'Grade 3', requiresParent: false },
  { label: 'Grade 4', value: 'Grade 4', requiresParent: false },
  { label: 'Grade 5', value: 'Grade 5', requiresParent: false },
  { label: 'Grade 6', value: 'Grade 6', requiresParent: false },
  { label: 'Grade 7 (JHS)', value: 'Grade 7', requiresParent: false },
  { label: 'Grade 8 (JHS)', value: 'Grade 8', requiresParent: false },
  { label: 'Grade 9 (JHS)', value: 'Grade 9', requiresParent: false },
  { label: 'Grade 10 (JHS)', value: 'Grade 10', requiresParent: false },
  { label: 'Grade 11 (SHS)', value: 'Grade 11', requiresParent: false },
  { label: 'Grade 12 (SHS)', value: 'Grade 12', requiresParent: false },
  { label: 'College', value: 'College', requiresParent: false },
  { label: 'Faculty/Staff', value: 'Staff', requiresParent: false },
];

export const isRestrictedStudent = (gradeLevel?: string): boolean => {
  if (!gradeLevel) return false;
  const grade = GRADE_LEVELS.find(g => g.value === gradeLevel);
  return grade ? grade.requiresParent : false;
};