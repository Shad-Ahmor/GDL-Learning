const fs = require('fs');

let content = fs.readFileSync('/Users/shadahmor/Documents/Projects/Windows Software/GDLLearning/src/features/academic/AcademicModule.jsx', 'utf8');

// 1. Remove the external Subject Modal
const subjectModalStart = content.indexOf('{/* Premium Add Subject Modal */}');
const subjectModalEndStr = '      {/* EDIT PLAN MODAL */}';
const subjectModalEnd = content.indexOf(subjectModalEndStr);

if (subjectModalStart > -1 && subjectModalEnd > -1) {
  content = content.substring(0, subjectModalStart) + content.substring(subjectModalEnd);
} else {
  console.log("Could not find Subject Modal block.");
}

// 2. Modify the Edit Plan Modal Header
const headerStartStr = `                  <div className="flex items-center gap-4">
                    {selectedClassId && (
                      <button onClick={() => {
                        setSubjectForm({ id: null, masterSubjectId: '', classId: selectedClassId, sectionId: selectedSectionId, isOptional: false, teacherId: '', startTime: schoolConfig?.schoolStartTime || '', endTime: schoolConfig?.schoolEndTime || '', daysOfWeek: [] });
                        setSubjectModalOpen(true);
                      }} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Subject
                      </button>
                    )}`;

const headerReplaceStr = `                  <div className="flex items-center gap-4">
                    {selectedClassId && !isSubjectModalOpen && (
                      <button onClick={() => {
                        setSubjectForm({ id: null, masterSubjectId: '', classId: selectedClassId, sectionId: selectedSectionId, isOptional: false, teacherId: '', startTime: schoolConfig?.schoolStartTime || '', endTime: schoolConfig?.schoolEndTime || '', daysOfWeek: [] });
                        setSubjectModalOpen(true);
                      }} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Subject
                      </button>
                    )}
                    {isSubjectModalOpen && (
                      <button onClick={() => setSubjectModalOpen(false)} className="bg-black/5 dark:bg-white/10 text-foreground px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-black/10 transition-all">
                        Back to List
                      </button>
                    )}`;

if (content.includes(headerStartStr)) {
  content = content.replace(headerStartStr, headerReplaceStr);
} else {
  console.log("Could not find Edit Plan Modal header block.");
}

// 3. Inject the form into the body
const bodyStartStr = `          {selectedClassId && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10">`;

const formContent = fs.readFileSync('form_content.txt', 'utf8');

const formWrapper = `
          {isSubjectModalOpen ? (
            <div className="max-w-3xl mx-auto bg-card rounded-[2rem] border border-white/10 premium-shadow">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{subjectForm.id ? 'Edit Subject Plan' : 'Plan Subject'}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    For <span className="font-bold text-purple-500">{classes.find(c => c.id === subjectForm.classId)?.name || 'Class'}</span> 
                    {' • '}
                    <span className="font-bold text-indigo-500">Section {classes.find(c => c.id === subjectForm.classId)?.sections?.find(s => s.id === subjectForm.sectionId)?.name || '?'}</span>
                  </p>
                </div>
              </div>
${formContent}
            </div>
          ) : (
            <>
`;

const bodyReplaceStr = formWrapper + bodyStartStr;

if (content.includes(bodyStartStr)) {
  content = content.replace(bodyStartStr, bodyReplaceStr);
} else {
  console.log("Could not find body start string.");
}

// Close the <> wrapper at the end of the modal content
const bodyEndStr = `                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>`;

const bodyEndReplaceStr = `                  </>
                )}
              </div>
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </motion.div>`;

if (content.includes(bodyEndStr)) {
  content = content.replace(bodyEndStr, bodyEndReplaceStr);
} else {
  console.log("Could not find body end string.");
}

fs.writeFileSync('/Users/shadahmor/Documents/Projects/Windows Software/GDLLearning/src/features/academic/AcademicModule.jsx', content);
console.log("Done");
