const http = require('http');

async function test() {
  const postData = JSON.stringify({
    admissionNumber: "ADM-999",
    firstName: "Test",
    lastName: "Student",
    dob: "2010-01-01",
    gender: "Male",
    admissionDate: "2024-01-01",
    classId: "",
    sectionId: "",
    fatherName: "Test Father",
    motherName: "Test Mother",
    primaryPhone: "1234567890",
    sessionId: ""
  });

  const res = await fetch('http://localhost:1422/api/students/admission', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: postData
  });
  
  const created = await res.json();
  console.log("CREATED:", created);

  const getRes = await fetch('http://localhost:1422/api/students');
  const students = await getRes.json();
  console.log("FETCHED:", JSON.stringify(students[0], null, 2));
}

test().catch(console.error);
