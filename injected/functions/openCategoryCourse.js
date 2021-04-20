// Inserts a function to open a course

async function MoodFixOpenCategoryCourse(courseNumber, numCourses) {
  const courses = document.querySelectorAll(".courses .coursename");
  chrome.runtime.sendMessage({ status: `Opening course ${courseNumber + 1}/${numCourses}` });
  window.location.href = courses[courseNumber].firstElementChild.href.replace("view", "edit");
};