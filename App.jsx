import { useState, useEffect } from "react"
import Quizzical from "./Quizzical"
import { shuffle } from "./utils.js"

export default function App() {
    const [quizQuestions, setQuizQuestions] = useState([])
    const [categories, setCategories] = useState([])
    
    let selectedDifficulty = 'any'
    let selectedCategory = 0

    useEffect(() => {
        fetch('https://opentdb.com/api_category.php')
            .then(response => response.json())
            .then(data => setCategories(data.trivia_categories))
    },[])
     
    function startQuiz(formData) {
        selectedDifficulty = formData.get('difficulty-select')
        selectedCategory = formData.get('category-select')
        
        fetch(`https://opentdb.com/api.php?amount=5${selectedCategory !== 0 ? '&category=' + selectedCategory : ''}${selectedDifficulty !== 'any' ? '&difficulty=' + selectedDifficulty : ''}&type=multiple`)
            .then(response => response.json())
            .then(data => {
                const questions = data.results.map(q => {
                    return {
                        ...q, 
                        choices: shuffle([
                            {value: q.correct_answer, isCorrect: true}, 
                            ...q.incorrect_answers.map(a => {return {value: a, isCorrect: false}})
                    ])}
                })
                setQuizQuestions(questions)
            })
    }
    
    return (
        <>
            <img className="blob top-right" src="./assets/blobs_yellow.svg" />
            <img className="blob bot-left" src="./assets/blobs_blue.svg" />
            <section className="main">
                {quizQuestions.length === 0 && 
                    <div className="starting-screen">
                        <h1>Quizzical</h1>
                        <span>Answer 5 questions to see if you have what it takes to be a trivia master!</span>
                        <form action={startQuiz}>
                            <label>
                                Pick a difficulty: 
                                <select defaultValue={selectedDifficulty} name="difficulty-select">
                                    <option value="any">Any Difficulty</option>
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </label>
                            <label>
                                Pick a category: 
                                <select defaultValue={selectedCategory} name="category-select">
                                    <option key={0} value={0}>Any Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                </label>
                            <button className="game-btn start">Start Quiz</button>
                        </form>
                    </div>
                }
                {quizQuestions.length > 0 && <Quizzical quizQuestions={quizQuestions} setQuizQuestions={setQuizQuestions} />}
            </section>
        </>
    )
}