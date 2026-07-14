const http = require('http');

async function test() {
  const getRes = await fetch('http://localhost:1422/api/students');
  let students = await getRes.json();
  const stu = students[0];
  console.log("Student fetched from /api/students:", JSON.stringify(stu, null, 2));

  // Simulating what handleEdit does
  const form = {
      id: stu.id,
      sessionId: stu.class?.sessionId || '',
      admissionNumber: stu.admissionNumber,
      enrollmentNumber: stu.enrollmentNumber || '',
      firstName: stu.firstName,
      lastName: stu.lastName,
      dob: new Date(stu.dob).toISOString().split('T')[0],
      gender: stu.gender,
      admissionDate: new Date(stu.admissionDate).toISOString().split('T')[0],
      classId: stu.classId,
      sectionId: stu.sectionId,
      fatherName: stu.parent?.fatherName || '',
      motherName: stu.parent?.motherName || '',
      primaryPhone: stu.parent?.primaryPhone || ''
  };

  console.log("Form populated for Edit:", JSON.stringify(form, null, 2));
}
test().catch(console.error);
