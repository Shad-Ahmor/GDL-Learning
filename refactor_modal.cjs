const fs = require('fs');

const path = '/Users/shadahmor/Documents/Projects/Windows Software/GDLLearning/src/features/academic/AcademicModule.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variable
if (!content.includes('const [isEditPlanModalOpen')) {
  content = content.replace(
    /const \[isPreviewModalOpen, setIsPreviewModalOpen\] = useState\(false\);/,
    `const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);\n  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);`
  );
}

// 2. Remove Add Subject button from main header (around line 2048)
content = content.replace(
  /\{selectedClassId && \([\s\S]*?<div className="bg-white\/20 p-1 rounded-full"\><Plus className="w-4 h-4" \/><\/div> Add Subject\s*<\/button>\s*\)\}/,
  ""
);

// 3. Update Edit Plan button onClick
content = content.replace(
  /onClick=\{\(\) => \{\s*setSelectedClassId\(c\.id\);\s*setSelectedSectionId\(sec\.id\);\s*setTimeout\(\(\) => \{\s*document\.getElementById\('manage-class-section'\)\?\.scrollIntoView\(\{ behavior: 'smooth', block: 'start' \}\);\s*\}, 100\);\s*\}\}/,
  `onClick={() => {
                                  setSelectedClassId(c.id);
                                  setSelectedSectionId(sec.id);
                                  setIsEditPlanModalOpen(true);
                                }}`
);

// 4. Extract the Manage Class section (from `<div id="manage-class-section"` to just before `{/* Premium Add Class Modal */}`)
// It looks like:
//           <div id="manage-class-section" ...>
//           ...
//           {selectedClassId && selectedSectionId && ( ... )}
//         </div>
//       )}
//
//       {/* Premium Add Class Modal */}
const startMarker = '<div id="manage-class-section"';
const endMarker = '{/* Premium Add Class Modal */}';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  // We need to carefully extract the block.
  // Wait, there's a closing `</div>\n      )}\n` right before `Premium Add Class Modal`.
  // Let's just find the exact text from `startIndex` to `endIndex`.
  const extractedBlock = content.substring(startIndex, endIndex);
  
  // We only want the UI part. It's actually safer to just regex the parts we need out, or put the modal around it.
  // Actually, I'll just remove `extractedBlock` from its original place, EXCEPT for the `</div>\n      )}\n` at the end which belongs to the `activeTab === 'subjects'` block!
  
  // Let's find the closing of `activeTab === 'subjects'`
  const lastDivStr = '        </div>\n      )}\n\n      ';
  const blockToRemove = content.substring(startIndex, endIndex - lastDivStr.length);
  
  // Remove the block from original place
  content = content.replace(blockToRemove, "");

  // Now we need to create the Modal JSX using the extracted UI parts.
  const modalJSX = `
      {/* EDIT PLAN MODAL */}
      {typeof document !== 'undefined' ? createPortal(
        <AnimatePresence>
          {isEditPlanModalOpen && (
            <div className="fixed inset-0 flex justify-center items-center p-4 sm:p-8" style={{ zIndex: 99998 }}>
              <div 
                className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm cursor-pointer" 
                onClick={() => setIsEditPlanModalOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                className="relative w-full max-w-[95vw] lg:max-w-7xl bg-white/95 dark:bg-black/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.2)] dark:shadow-[0_0_100px_rgba(255,255,255,0.05)] flex flex-col max-h-[90vh] overflow-hidden z-10"
              >
                {/* Header */}
                <div className="flex-none p-6 md:p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 relative z-30 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-purple-500/30">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Manage Class Subjects</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-xs font-black text-foreground uppercase tracking-widest">
                          Class {classes.find(c => c.id === selectedClassId)?.name || ''}
                        </span>
                        {selectedSectionId && (
                          <span className="px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-widest">
                            Section {classes.find(c => c.id === selectedClassId)?.sections?.find(s => s.id === selectedSectionId)?.name || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {selectedClassId && (
                      <button onClick={() => {
                        setSubjectForm({ id: null, masterSubjectId: '', classId: selectedClassId, sectionId: selectedSectionId, isOptional: false, teacherId: '', startTime: schoolConfig?.schoolStartTime || '', endTime: schoolConfig?.schoolEndTime || '', daysOfWeek: [] });
                        setSubjectModalOpen(true);
                      }} className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all premium-shadow hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        <div className="bg-white/20 p-1 rounded-full"><Plus className="w-4 h-4" /></div> Add Subject
                      </button>
                    )}
                    <button
                      onClick={() => setIsEditPlanModalOpen(false)}
                      className="p-3 bg-black/5 dark:bg-white/10 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 text-muted-foreground rounded-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                {/* Scrollable Content Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative z-20">
                  {/* Inner extracted block without the outer class selector */}
                  ${blockToRemove.replace(/<div id="manage-class-section"[\s\S]*?<\/div>/, '')}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      ) : null}
`;

  // Insert the modal right before the PREVIEW MODAL
  content = content.replace('{/* WEEKLY SCHEDULE PREVIEW MODAL */}', modalJSX + '\n      {/* WEEKLY SCHEDULE PREVIEW MODAL */}');

  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully extracted and wrapped in Modal!");
} else {
  console.log("Could not find start/end markers.");
}
