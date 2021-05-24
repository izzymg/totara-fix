(function() {
    const courseTitle = document.querySelector(".breadcrumb").children[2].querySelector("a").title;
    document.querySelector("#fitem_id_name input").value = `You passed the ${courseTitle} quiz`;
    document.querySelector("#id_description").value = `Congratulations on successfully completing the ${courseTitle} quiz!`;
})();