let questionEl = document.getElementById("question");
let styles = ["card-1", "card-2", "card-3", "card-4", "card-5"];

const updateHamburgerARIA = () => {
    const hamburger = document.getElementById("hamburger-toggle");

    if (hamburger.checked) {
        document.getElementById("menu").classList.add("show");
    } else {
        document.getElementById("menu").classList.remove("show");
    }
    hamburger.setAttribute("aria-expanded", hamburger.checked ? "true" : "false");
    menu.setAttribute("aria-hidden", !hamburger.checked ? "true" : "false");
};


let updateAllParentChecked = function (parentId) {
    let root = [];

    if (parentId !== undefined) {
        root.push(document.querySelector(`input[type=checkbox][name=sources][data-question_id="${parentId}"]`));
    } else {
        root = document.querySelectorAll('input[type=checkbox][name=sources][data-question_id]');
    }

    root.forEach((parentCb) => {
        let checked = 0, unchecked = 0;

        document.querySelectorAll(`input[type=checkbox][name=sources][data-parent_id="${parentCb.dataset.question_id}"]`).forEach((checkbox) => {
            if (checkbox.checked) {
                ++checked;
            } else {
                ++unchecked;
            }
        });

        if (0 === checked === unchecked) {
            return;
        } else if (checked > 0 && unchecked > 0) {
            parentCb.classList.add("partial");
            parentCb.checked = false;
        } else if (checked > 0 && unchecked === 0) {
            parentCb.classList.remove("partial");
            parentCb.checked = true;
        } else if (checked === 0 && unchecked > 0) {
            parentCb.checked = false;
        }
    });
}

window.addEventListener('load', function () {
    const menu = document.getElementById("menu");

    menu.innerHTML = "";
    document.getElementById('generate').addEventListener('click', function () {
        setQuestion(getRandomQuestion());
    });

    document.getElementById('hamburger-toggle').addEventListener('click', updateHamburgerARIA);

    let updateSubCheckboxes = function (checkbox) {
        if (!checkbox.dataset.question_id) {
            return;
        }

        checkbox.classList.remove("partial");

        document.querySelectorAll(`input[type=checkbox][name=sources][data-parent_id="${checkbox.dataset.question_id}"]`).forEach((el) => {
            // Always uncheck everything, but only check defaults
            if (!checkbox.checked || (checkbox.checked && el.dataset.is_default == "true")) {
                el.checked = checkbox.checked;
            }
        });
    }

    // Function to create a checkbox with a wrapping label
    function createCheckboxWithLabel(labelText, value, url, isDefault, id, isSubgroup, parentElement) {
        // Create the label element
        const label = document.createElement('label');

        // Create the input (checkbox) element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = "sources";
        checkbox.value = value;
        checkbox.dataset.url = url;
        checkbox.dataset.source = value;
        checkbox.dataset.is_default = isDefault == undefined ? true : isDefault;

        if (isSubgroup) {
            checkbox.dataset.parent_id = id;
        } else {
            checkbox.dataset.question_id = id;
        }

        // Append the checkbox and then the label text to the label element
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(labelText));

        // Append the complete label to the specified parent element in the DOM
        parentElement.appendChild(label);

        checkbox.addEventListener('change', function (evt) {
            if (this.dataset.question_id) {
                updateSubCheckboxes(this);
            } else {
                updateAllParentChecked(this.dataset.parent_id);
            }


            saveSelectedSources(getSelectedSources());
        });

        return checkbox;
    }
    let cbCount = 0;

    questions.forEach(quest => {
        ++cbCount;
        let li = document.createElement('li');

        menu.appendChild(li);

        if ('categories' in quest) {
            let div = document.createElement('div');
            div.classList.add("collapsable");
            div.innerText = "⌃";
            li.appendChild(div);

            let ulSub = document.createElement('ul');
            createCheckboxWithLabel(quest.name, quest.name, quest.url, quest.isDefault, cbCount, false, li);
            li.appendChild(ulSub);

            quest.categories.forEach((group) => {
                let liSub = document.createElement('li');
                createCheckboxWithLabel(group.name, `${quest.name} / ${group.name}`, quest.url, group.isDefault, cbCount, true, liSub).questions = group.questions;
                ulSub.appendChild(liSub);
            });
        } else {
            createCheckboxWithLabel(quest.name, quest.name, quest.url, quest.isDefault, cbCount, false, li).questions = quest.questions;
        }
    });

    document.querySelectorAll("div.collapsable").forEach((el) => {
        el.addEventListener("click", (event) => {
            let classes = event.originalTarget.classList;

            if (classes.contains('expanded')) {
                classes.remove("expanded");
            } else {
                classes.add("expanded");
            }
        });
    });

    // Uncheck all sources
    document.querySelectorAll("input[type=checkbox][name=sources]").forEach((el) => {
        el.checked = false;
    });


    loadSelectedSources().then(loaded => {
        if (!loaded) {
            // There were no saved sources, so check them all
            document.querySelectorAll("input[type=checkbox][name=sources]").forEach((el) => {
                if (el.dataset.is_default == "true") {
                    el.checked = true;
                }
            });
        }

        loadSelectedQuestion().then(loaded => {
            if (!loaded) {
                setQuestion(getRandomQuestion());
            }
            updateAllParentChecked();
        });

    });


});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

let getRandomQuestion = function () {
    let checkedGroups = document.querySelectorAll("input[type=checkbox][name=sources]:checked");

    let totalQuestions = 0;
    checkedGroups.forEach((el) => {
        if (el.questions) {
            totalQuestions += el.questions.length;
        }
    });

    let questionIndex = getRandomInt(0, totalQuestions);
    let questionCount = 0;
    let currentQuestion = {};

    for (let i = 0, j = checkedGroups.length; i < j; ++i) {
        let el = checkedGroups[i];
        if (el.questions) {
            if (el.questions.length + questionCount > questionIndex) {
                currentQuestion = {
                    source: el.dataset.source,
                    question: el.questions[questionIndex - questionCount],
                    url: el.dataset.url
                };

                break;
            }
            questionCount += el.questions.length;
        }
    };
    return currentQuestion;
}

let getSecondsLeftInDay = function () {
    const now = new Date();
    const midnightTonight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const timeUntilMidnightMs = midnightTonight.getTime() - now.getTime();

    return Math.floor(timeUntilMidnightMs / 1000);;
}

let getSelectedSources = function () {
    let sources = [];
    document.querySelectorAll("input[type=checkbox][name=sources]:checked").forEach((el) => {
        if (el.questions) {
            sources.push(el.value);
        }
    });
    return sources;
}

async function saveSelectedSources(sources) {
    await cookieStore.set({
        name: "sources",
        value: JSON.stringify(sources),
        maxAge: Number.MAX_SAFE_INTEGER,
        secure: false
    });
};

async function loadSelectedSources() {
    const sourcesString = await cookieStore.get("sources");
    let loaded = false;

    if (sourcesString && sourcesString.value) {
        let val = JSON.parse(sourcesString.value);

        try {
            if (val && Array.isArray(val)) {
                selectSourcesByName(val);
                loaded = true;
            }

        } catch (err) {
            console.error("Unable to load saved sources", err);
        }
    }
    return Promise.resolve(loaded);
}

async function saveSelectedQuestion(currentQuestion) {
    await cookieStore.set({
        name: "question",
        value: JSON.stringify(currentQuestion),
        maxAge: getSecondsLeftInDay(),
        secure: false
    });
}

async function loadSelectedQuestion() {
    const question = await cookieStore.get("question");
    let loaded = false;
    if (question && question.value) {
        try {
            let val = JSON.parse(question.value);
            if (val.question) {
                setQuestion(val);
                loaded = true;
            }
        } catch (err) {
            console.error("Unable to load saved sources", err);
        }
    }
    return Promise.resolve(loaded);
}

let selectSourcesByName = function (sources) {
    sources.forEach((el) => {
        document.querySelector(`input[type=checkbox][name=sources][value="${el}"]`).checked = true;
    });
}

let setQuestion = function (currentQuestion, doSave = true) {
    document.startViewTransition(() => {
        questionEl.textContent = currentQuestion.question;
        let linkEl = document.getElementById("source-link");
        linkEl.setAttribute('href', currentQuestion.url);
        linkEl.textContent = currentQuestion.source;
    });

    if (doSave) {
        saveSelectedQuestion(currentQuestion);
    }

};

