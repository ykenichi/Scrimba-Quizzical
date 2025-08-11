import { useState, useEffect } from "react"
import he from "he"
import clsx from "clsx"
import Popup from 'reactjs-popup'

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
    
    useEffect(() => {
        async function fetchFeedback() {
            let fbArr = []
            if (!props.quizQuestions || props.quizQuestions.length === 0) {
                return
            }
            const prompts = props.quizQuestions.map(q => ({
                question: he.decode(q.question),
                answer: he.decode(q.correct_answer)
            }))
            const response = await fetch('/.netlify/functions/getClaudeFeedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({prompts})
            })
            const data = await response.json()
            fbArr = data && data.response ? [...data.response.split('\n\n')] : []
            //console.log("Claude response:", data.response)
            //const response = await getFeedbackFromClaude(prompts)

            if (fbArr.length < props.quizQuestions.length) {
                const missingCount = props.quizQuestions.length - fbArr.length
                for (let i = 0; i < missingCount; i++) {
                    fbArr.push("No explanation available.")
                }
            }
            setFeedbackArray(fbArr)
        }
        fetchFeedback()
    },[])
    
    return (
        <>
            <form className="quizForm" action={submitAnswers}>
                {props.quizQuestions.map((question,questionIdx) => {
                    return (
                        <div className="question">
                            <h1>{quizFinished && <span>{choiceIndices[questionIdx]?.isCorrect ? '✅' : '❌'}</span>} #{questionIdx + 1} {he.decode(question.question)}</h1>
                            {quizFinished &&
                                <Popup trigger={<button className="game-btn explanation" type="button">Explanation</button>} position="right">
                                    <div>{feedbackArray[questionIdx]}</div>
                                </Popup>
                            }
                            {question.choices.map((c,choiceIdx) => {
                                const answerCorrect = quizFinished && c.isCorrect;
                                const answerWrong = quizFinished && !c.isCorrect && choiceIdx === choiceIndices[questionIdx]?.index;

                                return (
                                    <>
                                        <input disabled={quizFinished} id={`choice-${questionIdx}-${choiceIdx}`} type="radio" name={`question-${questionIdx}`} value={`${choiceIdx}|${c.isCorrect}`}/>
                                        <label htmlFor={`choice-${questionIdx}-${choiceIdx}`} className={clsx('choice',{correct: answerCorrect, wrong: answerWrong})}>{he.decode(c.value)}</label>
                                    </>
                                )
                            })
                            }
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