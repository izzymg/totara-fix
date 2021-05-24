(function() {

  const fetchLog = (userId) => (pageNumber) => {
    return new Promise((resolve, reject) => {
      fetch(`https://careeracademy.online/report/log/user.php?id=${userId}&course=1&mode=all&logreader=logstore_standard&page=${pageNumber}`)
        .then(value => {
          value.text().then(txt => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(txt, "text/html");
            resolve(doc.querySelector("table.reportlog").outerHTML);
            resolve();
          }).catch(reject);
        }).catch(reject);
      });
    }
    
  function getUserID() {
    const idLink = document.querySelector(".breadcrumb").children[2].querySelector("a").href.toString();
    const id = idLink.slice(idLink.search(/[0-9]/));
    if(id.length < 1) {
      throw new Error("Failed to find user id");
    }
    return id;
  }
  
  function getPageCount() {
    // Page has two paging lists, so select one, then get the count of pages.
    return document.querySelector(".paging").querySelectorAll("a").length;
  }
  
  const fetchUserLog = fetchLog(getUserID());
  const pageCount = getPageCount();

  const promises = [...Array(pageCount).keys()].map(page => fetchUserLog(page));
  Promise.all(promises).then(v => {
    const tables = v.join("<br>");
    document.body.outerHTML = tables;
  }).catch(e => {
    console.error(e);
  });
})()