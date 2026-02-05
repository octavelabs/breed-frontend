"use client"

import QuizQuestion from '@/app/components/quiz';
import StepProgress from '@/app/components/StepProgress';
import DashboardLayout from '@/app/layout/DashboardLayout';
import Link from 'next/link';
import React, { useState } from 'react';
import LoadingScreen from './components/LoadingScreen';
import QuizCompletion from './components/QuizCompletion';


const Quiz: React.FC = () => {
      const [isLoading, setIsLoading] = useState(true);
      const [currentQuestion, setCurrentQuestion] = useState(0);
      const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
      const [quizCompleted, setQuizCompleted] = useState(false);

      const questions = [
        {
          question: "What was the direct result of Adam and Eve's disobedience in the Garden of Eden?",
          options: [
            { id: 'A', text: 'A. Eternal life' },
            { id: 'B', text: 'B. Sin and separation from God' },
            { id: 'C', text: 'C. Prosperity' },
            { id: 'D', text: 'D. Wisdom to follow God' }
          ]
        },
        {
          question: "What does the Bible say about God's grace?",
          options: [
            { id: 'A', text: 'A. It must be earned through good works' },
            { id: 'B', text: 'B. It is freely given to all who believe' },
            { id: 'C', text: 'C. It is only for certain people' },
            { id: 'D', text: 'D. It is temporary' }
          ]
        },
        {
          question: "What is the greatest commandment according to Jesus?",
          options: [
            { id: 'A', text: 'A. Love the Lord your God with all your heart' },
            { id: 'B', text: 'B. Attend church regularly' },
            { id: 'C', text: 'C. Give generously to the poor' },
            { id: 'D', text: 'D. Memorize Scripture' }
          ]
        }
      ];

         const handleLoadComplete = () => {
        setIsLoading(false);
      };

      const handleSelectAnswer = (answerId: string) => {
        setSelectedAnswer(answerId);
        
        // Auto-advance after a short delay
        setTimeout(() => {
          if (currentQuestion < questions.length - 1) {
            setSelectedAnswer(null);
          } else {
            alert('Quiz completed! 🎉');
          }
        }, 800);
      };

  const steps = questions.map((el) => (
    {
      subtitle: 'Quiz',
      title: 'The Fall That Made Grace Necessary',
      content: (
       <QuizQuestion
          question={questions[currentQuestion].question}
          options={questions[currentQuestion].options}
          onSelect={handleSelectAnswer}
          selectedAnswer={selectedAnswer}
        />
      )
    }
  ))


   if (isLoading) {
        return <LoadingScreen onLoadComplete={handleLoadComplete} />;
      }
      
if(quizCompleted){
  return <QuizCompletion />
}
  return (
    <DashboardLayout>  
    <div className="">
 
     <StepProgress
      steps={steps}
      onComplete={() => setQuizCompleted(true)}
      completeButtonText="Submit"
    />
    
    </div>
    </DashboardLayout>
  );
};

export default Quiz