(() => {

  console.log("Begin");

  const sendMessage = (data) => {
    chrome.runtime.sendMessage({
      ...data, sender: "badgeFixer",
    })
  };

  /** Toggle HTML editor on for message body */
  const enableHtml = () => {
      const htmlButton = document.querySelector(".atto_html_button");
      if(!htmlButton) {
        throw "Failed to find HTML toggle button";
      }
      // Already toggled on
      if(htmlButton.classList.contains("highlight")) {
        return;
      }
      htmlButton.click();
      return;
  };

  try {
    enableHtml();
  } catch(e) {
    console.error(e);
    sendMessage({ error: e });
    return;
  }

  const badgeSubjectEle = document.querySelector("input[name='messagesubject']");
  const badgeBodyEle = document.querySelector("textarea#id_message_editor");
  if(!badgeSubjectEle || !badgeBodyEle) {
    sendMessage({ error: "Failed to find message inputs, are you on the correct page?" });
    return;
  }

  const oldSubject = badgeSubjectEle.value;
  const oldBody = badgeBodyEle.value;

  // Remove common placeholder expressions, and remove 2 or more spaces and replace with a single
  // Subjects in badges cannot have any placeholders.
  const newSubject = badgeSubjectEle.value
    .replace(/\%username\%/g, "")
    .replace(/\%fullname\%/g, "")
    .replace(/\s{2,}/g, " ").trim();
  // console.log(newSubject);
  badgeSubjectEle.value = newSubject;
  // Replace %fullname% with %username% in the badge message body.
  newBody = badgeBodyEle.value.replace(/\%fullname\%/g, "%username%").trim();
  // console.log(newBody);
  badgeBodyEle.value = newBody;

  try {
    sendMessage({ replacementsMade: (newSubject.length - oldSubject.length) + (newBody.length - oldBody.length) });
    document.querySelector("#id_submitbutton").click();
  } catch(e) {
    console.error(e);
    const error = "Failed to save changes!";
    sendMessage({ error });
    return error;
  }
})();