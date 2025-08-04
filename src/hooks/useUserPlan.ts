import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';

export type UserPlan = 'basic' | 'pro' | null;

interface UseUserPlanProps {
  user: User | null;
}

export const useUserPlan = ({ user }: UseUserPlanProps) => {
  const [userPlan, setUserPlan] = useState<UserPlan>(null);

  useEffect(() => {
    if (user) {
      // Mock logic - in real app, this would fetch from database
      const plan = user.email?.includes('pro') ? 'pro' : 'basic';
      setUserPlan(plan);
    } else {
      setUserPlan(null);
    }
  }, [user]);

  const canAccessExamType = useCallback((examType: string): boolean => {
    if (!user) return false;
    if (userPlan === 'pro') return true;
    if (userPlan === 'basic') return examType === 'QUIZLET';
    return false;
  }, [user, userPlan]);

  const canAccessFeature = useCallback((feature: string): boolean => {
    if (!user) return false;
    if (userPlan === 'pro') return true;
    
    // Basic plan limitations
    switch (feature) {
      case 'quizlet':
        return true;
      case 'pe':
      case 'fe':
      case 'unlimited_quizzes':
      case 'detailed_reports':
        return false;
      default:
        return false;
    }
  }, [user, userPlan]);

  // New function to limit questions for anonymous users
  const getQuestionLimit = useCallback((totalQuestions: number): number => {
    if (!user) return 5; // Anonymous users limited to 5 questions
    if (userPlan === 'pro') return totalQuestions; // Pro users get all questions
    if (userPlan === 'basic') return Math.min(10, totalQuestions); // Basic users limited to 10 questions
    return 5; // Fallback for anonymous users
  }, [user, userPlan]);

  // New function to check if user needs to login to continue
  const needsLoginToContinue = useCallback((currentQuestionCount: number): boolean => {
    if (!user) return currentQuestionCount >= 5; // Anonymous users need login after 5 questions
    if (userPlan === 'basic') return currentQuestionCount >= 10; // Basic users need upgrade after 10 questions
    return false; // Pro users have unlimited access
  }, [user, userPlan]);

  // New function to get total questions to display (show all but limit access)
  const getTotalQuestionsToDisplay = useCallback((totalQuestions: number): number => {
    return totalQuestions; // Always show all questions
  }, []);

  const getPlanDisplay = useCallback((): string => {
    if (userPlan === 'pro') return 'Pro';
    if (userPlan === 'basic') return 'Basic';
    return 'Khách';
  }, [userPlan]);

  const getPlanColor = useCallback((): string => {
    if (userPlan === 'pro') return 'text-purple-600 bg-purple-50 border-purple-200';
    if (userPlan === 'basic') return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  }, [userPlan]);

  return {
    userPlan,
    canAccessExamType,
    canAccessFeature,
    getQuestionLimit,
    needsLoginToContinue,
    getTotalQuestionsToDisplay,
    getPlanDisplay,
    getPlanColor,
    isPro: userPlan === 'pro',
    isBasic: userPlan === 'basic',
    isGuest: userPlan === null
  };
}; 