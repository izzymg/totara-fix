(() => {

    const subject = "You no longer have access to %programfullname%"
    const messaging = "Hi %userfullname%,\n\nWe just wanted to let you know that you no longer have access to the %programfullname%. This could be due to one of a few reasons:\n\n\
1.\tYou have completed your studies, and the enrolment period has ended so your access to the course material has been removed – No action is required.\n\n\
2.\tYou requested that your studies be placed on hold or deferred – No action is required. You will automatically be re-enrolled when the on-hold/deferral period ends.\n\n\
3.\tYour enrolment period has ended, but you have not yet completed your studies – Contact the Student Services team to discuss an extension within 60 days of receiving this email – studentservices@thecareeracademy.com\n\n\
4.\tThere is an issue with your payments, and your access has been temporarily removed – Contact the Payment Services team to discuss payment options – collections@thecareeracademy.com\n\n\
If you have completed your studies, congratulations! We offer a great discount for returning students, so if you would like to enrol in another course with us, please contact one of our student advisors today via the chat function on our website.\n\n\
If you have any questions, then please contact us and we will be happy to help."

    const sendMessage = (data) => {
      chrome.runtime.sendMessage({
        ...data, sender: "loFixer",
      })
    };

    const getMainMessageEle = () => {
        const areas = document.querySelectorAll("textarea")
        for(const area of areas) {
            if(area.id.includes("mainmessage")) {
                return area
            }
        }
    }
    const getSubjectEle = () => {
        const areas = document.querySelectorAll(`input[type="text"]`)
        for(const area of areas) {
            if(area.id.includes("messagesubject")) {
                return area
            }
        }
    }
    const mainMessageEle = getMainMessageEle()
    if(!mainMessageEle) {
      sendMessage({ error: "No main element." })
      return
    }

    const subjectEle = getSubjectEle()
    console.log(subjectEle)
    if(!subjectEle) {
      sendMessage({ error: "No subject element." })
      return
    }

    subjectEle.value = subject
    mainMessageEle.value = messaging

  
    try {
      document.querySelector(`input[name="savechanges"]`).click()
      setTimeout(() => {
        document.querySelector(".ui-dialog-buttonset button:first-child").click()
        sendMessage("loUpdated")
      }, 200)
    } catch(e) {
      console.error(e);
      const error = "Failed to save changes!";
      sendMessage({ error });
      return error;
    }
  })();