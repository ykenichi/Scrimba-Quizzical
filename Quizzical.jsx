import { useState, useEffect } from "react"
import he from "he"
import clsx from "clsx"
import Popup from 'reactjs-popup';
import { getFeedbackFromClaude } from "./ai.js"

export default function Quizzical(props) {
    const [quizFinished, setQuizFinished] = useState(false)
    const [choiceIndices, setChoiceIndices] = useState([])
    const [feedbackArray, setFeedbackArray] = useState([])
    
    const totalQuestions = props.quizQuestions.length
    const correctQuestions = choiceIndices.filter(c => c.isCorrect).length

    function submitAnswers(formData) {
        if(!props.quizQuestions) {
            return
        }
        if (quizFinished) {
            setChoiceIndices([])
            setQuizFinished(false)
            props.setQuizQuestions([])
            return
        }
        
        let result = []
        for(let i = 0; i < props.quizQuestions.length; i++) {
            const answerData = formData.get(`question-${i}`)
            if (answerData) {
                const [choiceIdx, isCorrect] = answerData.split('|')
                result.push({isCorrect: isCorrect === "true", index: Number(choiceIdx)})
            }
            else {
                result.push({isCorrect: false, index: -1})
            }

        }
        setChoiceIndices(result)
        setQuizFinished(true)
    }
    
    function getFeedback(idx) {
        console.log(feedbackArray[idx])
        return
    }
    
    useEffect(() => {
        let fbArr = []
        for(const q of props.quizQuestions) {
            fbArr.push(getFeedbackFromClaude(q.question, q.correct_answer))
        }
        setFeedbackArray(fbArr)
    },[])
    
    return (
        <>
            <form className="quizForm" action={submitAnswers}>
                {props.quizQuestions.map((question,questionIdx) => {
                    return (
                        <div className="question">
                            <h1>{he.decode(question.question)}</h1>
                            {quizFinished &&
                                <Popup trigger={<button className="game-btn explanation" type="button">Explanation</button>} position="right">
                                    <div>{feedbackArray.length ? feedbackArray[questionIdx] : 'Claude API might be down, feedback can\'t be retrieved'}</div>
                                </Popup>
                            }
                            {question.choices.map((c,choiceIdx) => 
                                <>
                                    <input disabled={quizFinished} id={`choice-${questionIdx}-${choiceIdx}`} type="radio" name={`question-${questionIdx}`} value={`${choiceIdx}|${c.isCorrect}`}/>
                                    <label htmlFor={`choice-${questionIdx}-${choiceIdx}`} className={clsx('choice',{correct: quizFinished && c.isCorrect, wrong: quizFinished && !c.isCorrect && choiceIdx === choiceIndices[questionIdx]?.index})}>{he.decode(c.value)}</label>
                                </>
                            )}
                        </div>)
                    })
                }
                <div className="result-section">
                    {quizFinished && 
                        <p>You scored {correctQuestions}/{totalQuestions} correct answers.</p>
                    }
                    <button className="game-btn finish">{!quizFinished ? 'Check answers' : 'Play again'}</button>
                </div>
            </form>
        </>
    )
}