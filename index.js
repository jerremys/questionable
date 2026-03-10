let questionEl = document.getElementById("card");
let styles = ["card-1", "card-2", "card-3", "card-4", "card-5"];

window.addEventListener('load', function () {
    const nav = document.getElementById("navigation");
    const hamburger = document.getElementById("hamburger-toggle");
    const menu = document.getElementById("menu");

    menu.innerHTML = "";
    document.getElementById('generate').addEventListener('click', function () {
        setQuestion(getRandomQuestion());
    });

    let updateSubCheckboxes = function (checkbox, el) {
        let cont = checkbox.parentElement;

        while (cont && cont.nodeName != "LI") {
            cont = cont.parentElement;
        }

        if (cont) {
            cont.querySelectorAll("ul input[type=checkbox][name=sources]").forEach((el) => {
                el.checked = checkbox.checked;
            });
        }

    }

    // Function to create a checkbox with a wrapping label
    function createCheckboxWithLabel(labelText, value, url, parentElement) {
        // Create the label element
        const label = document.createElement('label');

        // Create the input (checkbox) element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = "sources";
        checkbox.value = value;
        checkbox.dataset.url = url;
        checkbox.dataset.source = value;

        // Append the checkbox and then the label text to the label element
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(labelText));

        // Append the complete label to the specified parent element in the DOM
        parentElement.appendChild(label);

        checkbox.addEventListener('change', function (el) {
            updateSubCheckboxes(this, el);
            saveSelectedSources(getSelectedSources());
        });

        return checkbox;
    }

    questions.forEach(quest => {
        let li = document.createElement('li');

        menu.appendChild(li);

        if ('categories' in quest) {
            let div = document.createElement('div');
            div.classList.add("collapsable");
            li.appendChild(div);


            let ulSub = document.createElement('ul');
            createCheckboxWithLabel(quest.name, quest.name, quest.url, li);
            li.appendChild(ulSub);

            quest.categories.forEach((group) => {
                let liSub = document.createElement('li');
                createCheckboxWithLabel(group.name, `${quest.name} / ${group.name}`, quest.url, liSub).questions = group.questions;
                ulSub.appendChild(liSub);
            });
        } else {
            createCheckboxWithLabel(quest.name, quest.name, quest.url, li).questions = quest.questions;
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


    const updateHamburgerARIA = () => {
        hamburger.setAttribute("aria-expanded", hamburger.checked ? "true" : "false");
        menu.setAttribute("aria-hidden", !hamburger.checked ? "true" : "false");
    };
    hamburger.addEventListener("change", updateHamburgerARIA);

    // Uncheck all sources
    document.querySelectorAll("input[type=checkbox][name=sources]").forEach((el) => {
        el.checked = false;
    });


    loadSelectedSources().then(loaded => {
        if (!loaded) {
            // There were no saved sources, so check them all
            document.querySelectorAll("input[type=checkbox][name=sources]").forEach((el) => {
                el.checked = true;
            });
        }
    });

    loadSelectedQuestion().then(loaded => {
        if (!loaded) {
            setQuestion(getRandomQuestion());
        }
    });

    window.addEventListener("click", (event) => {
        const eventPath = event.composedPath();
        const isTargeted = eventPath.includes(nav);
        if (!isTargeted) {
            hamburger.checked = false;
            updateHamburgerARIA();
        }
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

    let cardClassList = document.getElementById("card").classList;

    let newStyle
    do {
        newStyle = styles[Math.floor(Math.random() * styles.length)]
    } while (cardClassList.contains(newStyle));

    cardClassList.remove(...styles);
    cardClassList.add(newStyle);
};

