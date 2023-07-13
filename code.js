let pageInput = document.getElementById("pageinput");
let choosePageButton = document.getElementById("choosepagebutton");
let newQuesButton = document.getElementById("newquesbutton");
newQuesButton.style.display = "none";
let checkAnsButton = document.getElementById("checkansbutton");
checkAnsButton.style.display = "none";
let correctAns = document.getElementById("correctans");
let sourcing = document.getElementById("sourcing");
let sp = document.getElementById("sp");
let paragraphs;
let answers;
let paragraphIndex;

choosePageButton.addEventListener("click", async ()=>{
    checkAnsButton.style.display = "none";
    newQuesButton.style.display = "block";
    sp.innerText = "";
    correctAns.innerText = "";
    let page = pageInput.value;
    let content = await fetchWikiContent(page);
    if (content.missing == undefined) {
        sourcing.innerText = "The sentence(s) below are copied from: https://en.wikipedia.org/wiki/"+page+"\nSome words have been replaced with blanks that have to be filled in.";
        paragraphs = content.split("\n");
        for (let i=0; i<paragraphs.length; i++) {
            let charCode = paragraphs[i].charCodeAt(0);
            if (charCode < 65 || charCode > 90 || paragraphs[i].includes("[[") == false) {
                paragraphs.splice(i, 1);
                i --;
            }
        }
    } else {
        sourcing.innerText = page+" is not a valid Wikipedia page title.";
    }
});

newQuesButton.addEventListener("click", ()=>{
    newQuesButton.style.display = "none";
    if (paragraphs.length == 0) {
        sourcing.innerText = "You have answered all of the questions. Click \"Choose Page\" again to restart.";
        sp.innerText = "";
    } else {
        checkAnsButton.style.display = "block";
        correctAns.innerText = "";
        paragraphIndex = Math.floor(Math.random()*paragraphs.length);
        let p = paragraphs[paragraphIndex];
        while (p.includes("<ref")) {
            let newp = p.substring(0, p.indexOf("<ref"));
            newp += p.substring(p.indexOf("</ref>")+6, p.length);
            p = newp;
        }
        let parts = p.split("[[");
        answers = [];
        sp.innerText = "";
        parts.forEach((item)=>{
            let part = item.split("]]");
            if (part.length == 2) {
                let ans = part[0].split("|");
                answers.push(ans[ans.length-1]);
                // https://stackoverflow.com/questions/74918176/how-to-insert-a-created-input-tag-into-a-created-p-tag-with-text
                sp.append(document.createElement("input"));
                sp.innerHTML += part[1];
            } else {
                sp.innerHTML += part[0];
            }
        });
    }
});

checkAnsButton.addEventListener("click", ()=>{
    checkAnsButton.style.display = "none";
    newQuesButton.style.display = "block";
    let greenCount = 0;
    for (let i=0; i<sp.children.length; i++) {
        let input = sp.children[i];
        greenCount += colorInput(input, i);
        input.addEventListener("input", ()=>{colorInput(input, i)});
    }
    correctAns.innerText = "Correct Answers: "+answers.join(", ");
    if (greenCount == answers.length) {
        paragraphs.splice(paragraphIndex, 1);
    }
});

function colorInput(input, i){
    if (input.value == answers[i]) {
        input.style.background = "green";
        return 1;
    } else {
        input.style.background = "red";
        return 0;
    }
}

// https://en.wikipedia.org/wiki/Special:ApiSandbox#action=query&list=search&srsearch=meaning
// https://stackoverflow.com/questions/23952045/wikipedia-api-cross-origin-requests

// https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page
async function fetchWikiContent(page){
    let text = await (await fetch("https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles="+page+"&rvslots=*&rvprop=content&formatversion=2&origin=*&format=json")).json();
    text = text.query.pages[0];
    if (text.missing == undefined) {
        text = text.revisions[0].slots.main.content;
        return text;
    }
    return {missing: true};
}