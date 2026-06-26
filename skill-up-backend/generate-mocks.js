const fs = require('fs');

const teacherId = '6a3bd5e1a47451cef123d873';
const subjects = ['SWP391', 'DBI202', 'PRU212', 'SSL101c', 'SSG'];
const statuses = ['draft', 'public'];

const generateObjectId = () => {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16);
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, () => {
        return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
};

const records = [];

for (let i = 1; i <= 20; i++) {
    const numQuestions = Math.floor(Math.random() * 5) + 1;
    const questions = [];
    
    for (let j = 1; j <= numQuestions; j++) {
        const correctIndex = Math.floor(Math.random() * 4);
        questions.push({
            questionText: `Câu hỏi ${j} của bộ đề ${i}: Khái niệm cơ bản trong môn này là gì?`,
            options: [`Khái niệm A`, `Khái niệm B`, `Khái niệm C`, `Khái niệm D`],
            correctAnswerIndex: correctIndex,
            explanation: `Giải thích chi tiết cho câu hỏi ${j}`,
            _id: { $oid: generateObjectId() }
        });
    }

    records.push({
        _id: { $oid: generateObjectId() },
        title: `Bộ câu hỏi ôn tập ${i}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        teacherId: { $oid: teacherId },
        xp: Math.floor(Math.random() * 10) * 10 + 10,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        questions: questions,
        plays: Math.floor(Math.random() * 100),
        deleted: false,
        createdAt: { $date: new Date().toISOString() },
        updatedAt: { $date: new Date().toISOString() },
        __v: 0
    });
}

fs.writeFileSync('mock_quizzes.json', JSON.stringify(records, null, 2));
console.log('Created mock_quizzes.json');
