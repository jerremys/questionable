let questionEl = document.getElementById("quote");
let styles = ["card-1", "card-2", "card-3", "card-4", "card-5"];
let questions = ["What is the most interesting course you have ever taken in school?", "What is your favorite quotation?", "What is one item you might keep forever?", "What were you known for in high school? Did you have any nicknames?", "If you could have witnessed any event in sports history, what would it be?", "What is something you consider beautiful?", "What was your first song you played over and over again?", "What accomplishment are you most proud of?", "If you could be an apprentice to any person, from whom would you want to learn?", "What are three things that make you happy?", "What’s one movie you think everyone should see? What’s a movie nobody should see?", "Who inspires you?", "What’s one thing you want to do before you die?", "Get in groups of three people. What’s the most bizarre thing you have in common?", "Whenever you are having a bad day, what is the best thing you can do to cheer yourself up?", "Have you ever experienced something unexplainable or supernatural?", "What was your best Halloween costume?", "What’s the last item you purchased and why?", "What was the last thing you Googled out of pure curiosity?", "What YouTube or TikTok video do you watch over and over?", "What’s the kindest act you’ve ever witnessed?", "Tell us one thing you know you do well (a talent?) and one thing you know you cannot do.", "What is your favorite way to procrastinate?", "What is your favorite home-cooked meal?", "What was your favorite childhood toy?", "What clubs are you involved in?", "What was your first paid job?", "Have you met a famous person? Who?", "What’s the story behind your name?", "Do you believe in anything that most people might not believe in?", "How would you answer this: I wish everyone would __________________________.", "What’s the best sound effect you can make?", "What’s the funniest thing you did as a kid that people still talk about today?", "What idea do you think is worth arguing about?", "What is something quirky about you?", "For what reason do others often seek your help or input?", "What is your guilty pleasure—something you love that almost embarrasses you?", "What is one thing that’s important for others to know about you?", "Do you still do anything today that you also loved to do as a child?", "Do you have any daily rituals?", "What is the most misunderstood word you can think of?", "What is the first book you remember changing you somehow?", "What piece of wisdom do you like to pass on?", "Do you have an irrational fear or strange addiction?", "What’s been the most surprising thing about this stage of life you’re in now?", "What is your biggest pet peeve?", "Who are your animal friends?", "What’s your latest failure?", "What’s something new you’ve learned this week?", "What thought keeps you up at night?", "What’s a question you like people to ask you?", "What’s one thing that truly fascinates you?", "Think of the best community you’ve been a part of. What made this community so great?", "If you had to pick a song for your “entrance music,” what would it be?", "What’s something funny or surprising that happened to you lately?", "When did you do something you thought you couldn’t do this year? When were you brave?", "What are you learning?", "What is your latest victory in life?", "When was the last time you felt really good about yourself? What was happening?", "Tell us about an encounter you had with a stranger, a strange place, or a strange animal.", "What’s something that made you experience wonder or awe this year?", "What’s something you experienced in childhood that childrentoday don’t experience?", "What’s one piece of good news?", "What’s stressing you out most today?", "What changes when you enter a room?", "If you had to sing a karaoke song, which one would you choose?", "What could be the best compliment someone could give you?", "What trait do you most admire in someone else?", "How would you want others to describe you?", "What do you look forward to each day?", "What is the most heartwarming thing you’ve ever seen?", "What have you most recently formed an opinion about?", "Where is the most relaxing place you’ve ever been?", "What fictional place would you most like to go to?", "What are you most likely to become famous for?", "What’s worth spending more on to get the best?", "What is special about the place you grew up?", "What fad or trend do you hope comes back?", "Where’s the farthest you’ve ever been from home?", "What takes up too much of your time?", "What’s an essential workplace item for you?", "What job would you be terrible at?", "What’s the story behind the longest you’ve ever gone without sleep?", "How is your day going on a scale of 1 to 10? What would make it a 10?", "What do you like to do the old-fashioned way?", "What popular TV or movie do you refuse to watch?", "What’s the story behind a piece of clothing or jewelry you’re wearing?", "What concept do you try to explain but often feel misunder-stood when you do?", "What is your ideal city to live in and why?", "Have you ever tried to grow something? What happened?", "What’s overrated? What’s underrated?", "What’s something you didn’t want to do but were glad you did?", "What’s your signature meal? What’s the best meal you’ve ever had?", "What are your tips for staying hydrated?", "What’s your favorite study spot?", "What is your role in a group or in your family?", "What feels like “home” to you?", "How do you pass the time on an airplane/train/car trip?", "What did you bring for show-and-tell as a child? If you can’t remember, what would you bring for show-and-tell now?", "What quality do you most respect in other people and why?"];

async function loadCookie() {
    const cookieIdxs = await cookieStore.get("question_indexes");
    let questionIndexes = cookieIdxs ? cookieIdxs.value.split(",") : [];

    questionIndexes.forEach((questionIdx, index) => {
        questionIndexes[index] = parseInt(questionIdx);
    });

    document.querySelector(`input[type="radio"][value="${questionIndexes.length ? questionIndexes.length : 1}"]`).checked = true;

    loadQuestions(questionIndexes);
}

let loadQuestions = function (questionIndexes) {
    if (questionIndexes === undefined) {
        questionIndexes = [];
    }

    if (questionIndexes.length === 0) {
        let questionCount = parseInt(document.querySelector('input[type=radio]:checked').value);
        for (let i = 0, j = questionCount; i < j; ++i) {
            questionIndexes.push(Math.floor(Math.random() * questions.length));
        }
    }

    setQuestion(getQuestionText(questionIndexes));
};


function getSecondsLeftInDay() {
    const now = new Date();
    const midnightTonight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const timeUntilMidnightMs = midnightTonight.getTime() - now.getTime();

    return Math.floor(timeUntilMidnightMs / 1000);;
}

// Example usage:
const secondsRemaining = getSecondsLeftInDay();



async function saveCookie(quoteIndexes) {
    let zxcv = getSecondsLeftInDay();
    await cookieStore.set({
        name: "question_indexes",
        value: quoteIndexes,
        maxAge: 500,
        secure: false
    });
}

let getQuestionText = function (quoteIndexes) {
    let questionsText = [];

    quoteIndexes.forEach((questionIdx, index) => {
        questionsText.push(questions[questionIdx]);
    });

    saveCookie(quoteIndexes);

    return questionsText;
}

let getQuestionCount = function () {
    return parseInt(document.querySelector('input[type=radio]:checked').value);
}

let genQuestion = function () {
    loadQuestions();
}

let setQuestion = function (questionsText) {
    questionEl.innerHTML = questionsText.join("<br><br>");
    let cardClassList = document.getElementById("card").classList;

    cardClassList.remove(...styles);
    cardClassList.add(styles[Math.floor(Math.random() * styles.length)]);
};

let setupListeners = function () {
    document.getElementById('generate').addEventListener('click', genQuestion);

    const radioButtons = document.querySelectorAll('input[name="question_count_option"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', function () {
            genQuestion();
        });
    });
}

setupListeners();
loadCookie();
