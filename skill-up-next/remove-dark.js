const fs = require('fs');
const path = require('path');
const files = [
  'src/app/(page)/student/quizzes/page.tsx',
  'src/app/(page)/student/quizzes/history/page.tsx',
  'src/app/(page)/student/quizzes/[id]/page.tsx',
  'src/app/(page)/teacher/quizzes/page.tsx',
  'src/app/(page)/teacher/quizzes/create/page.tsx',
  'src/app/(page)/teacher/quizzes/trash/page.tsx',
  'src/app/(page)/teacher/quizzes/[id]/edit/page.tsx'
];
files.forEach(f => {
  const fullPath = path.join(process.cwd(), f);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/dark:[^\s"'\`]+/g, '');
    // clean up any multiple spaces created by replacement
    content = content.replace(/\s{2,}(?=["'\`])/g, ' '); 
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Fixed ' + f);
  }
});
