export const sampleQuizQuestions = [
  {
    question: "מהי הדרך הטובה ביותר ללמוד מושגים חדשים?",
    question_type: "multiple_choice",
    options: [
      "חזרה מכנית על המידע",
      "קישור לידע קיים ויצירת דוגמאות",
      "קריאה חד-פעמית של החומר",
      "השתמשות רק בזיכרון חזותי"
    ],
    correct_answer: "קישור לידע קיים ויצירת דוגמאות",
    explanation: "למידה אפקטיבית נוצרת כאשר אנחנו מקשרים מידע חדש לידע קיים ויוצרים דוגמאות ממשיות.",
    difficulty: "medium"
  },
  {
    question: "איזה מהכלים הבאים הכי יעיל לחזרה על חומר לימוד?",
    question_type: "multiple_choice", 
    options: [
      "כרטיסיות זיכרון (Flashcards)",
      "קריאה חוזרת של הספר",
      "צפייה בסרטונים בלבד",
      "שינה במקום לימוד"
    ],
    correct_answer: "כרטיסיות זיכרון (Flashcards)",
    explanation: "כרטיסיות זיכרון מאפשרות חזרה פעילה ובדיקה עצמית, מה שמחזק את הזיכרון לטווח ארוך.",
    difficulty: "easy"
  },
  {
    question: "מה המשמעות של 'למידה פעילה'?",
    question_type: "multiple_choice",
    options: [
      "להיות ער בזמן הלימוד",
      "לקרוא בקול רם",
      "לעסוק בחשיבה, דיון והפעלת הידע",
      "ללמוד עמידה"
    ],
    correct_answer: "לעסוק בחשיבה, דיון והפעלת הידע",
    explanation: "למידה פעילה כוללת מעורבות אקטיבית בתהליך הלמידה - חשיבה ביקורתית, פתרון בעיות ויישום הידע.",
    difficulty: "medium"
  },
  {
    question: "איזה מהגורמים הבאים הכי חשוב לזיכרון לטווח ארוך?",
    question_type: "multiple_choice",
    options: [
      "כמות השעות שבהן אנחנו לומדים",
      "איכות ועומק העיבוד של המידע",
      "הזמן ביום שבו אנחנו לומדים",
      "מספר הפעמים שאנחנו קוראים את החומר"
    ],
    correct_answer: "איכות ועומק העיבוד של המידע",
    explanation: "עיבוד עמוק ומשמעותי של המידע חשוב יותר מכמות הזמן שמקדישים ללימוד.",
    difficulty: "hard"
  },
  {
    question: "מהו האפקט של 'ריווח בזמן' (Spaced Repetition)?",
    question_type: "multiple_choice",
    options: [
      "גורם לשכחה מהירה יותר",
      "משפר את הזיכרון לטווח ארוך",
      "מתאים רק לשפות זרות",
      "פועל רק עם זיכרון חזותי"
    ],
    correct_answer: "משפר את הזיכרון לטווח ארוך",
    explanation: "חזרה מרווחת בזמן מחזקת את קשרי הזיכרון ומשפרת משמעותית את השמירה לטווח ארוך.",
    difficulty: "medium"
  },
  {
    question: "איזה סביבת לימוד הכי מועילה לרוב האנשים?",
    question_type: "multiple_choice",
    options: [
      "מקום רועש ומלא הסחות דעת",
      "מקום שקט עם תאורה טובה וללא הסחות",
      "רק בספרייה",
      "אין חשיבות לסביבה"
    ],
    correct_answer: "מקום שקט עם תאורה טובה וללא הסחות",
    explanation: "סביבה שקטה ומסודרת מאפשרת ריכוז טוב יותר ולמידה יעילה יותר.",
    difficulty: "easy"
  },
  {
    question: "מה התכונה החשובה ביותר של הערות יעילות?",
    question_type: "multiple_choice",
    options: [
      "לכתוב כל מילה שהמרצה אומר",
      "לכתוב רק בעט כחול",
      "לסכם ולארגן את המידע במילים שלך",
      "לכתוב רק תאריכים וזמנים"
    ],
    correct_answer: "לסכם ולארגן את המידע במילים שלך",
    explanation: "עיבוד המידע ותרגומו למילים שלך מחזק את ההבנה ומשפר את הזיכרון.",
    difficulty: "medium"
  },
  {
    question: "מתי הכי טוב לעשות חזרה על חומר שנלמד?",
    question_type: "multiple_choice",
    options: [
      "רק לפני המבחן",
      "תוך 24 שעות מהלימוד הראשוני",
      "אחרי שבוע בלבד",
      "אין חשיבות לזמן"
    ],
    correct_answer: "תוך 24 שעות מהלימוד הראשוני",
    explanation: "חזרה זמן קצר לאחר הלימוד הראשוני מונעת שכחה ומחזקת את החומר בזיכרון לטווח ארוך.",
    difficulty: "easy"
  }
];

export const createSampleQuestions = async (supabase: any, notebookId: string) => {
  try {
    const questionsToInsert = sampleQuizQuestions.map(q => {
      // Find the correct answer and filter out wrong answers
      const wrongAnswers = q.options.filter(option => option !== q.correct_answer);
      
      // Ensure we have exactly 3 wrong answers, pad with empty strings if needed
      while (wrongAnswers.length < 3) {
        wrongAnswers.push('');
      }

      return {
        question: q.question,
        question_type: q.question_type,
        correct_answer: q.correct_answer,
        wrong_answer_1: wrongAnswers[0] || '',
        wrong_answer_2: wrongAnswers[1] || '',
        wrong_answer_3: wrongAnswers[2] || '',
        explanation: q.explanation,
        difficulty: q.difficulty,
        notebook_id: notebookId,
        options: JSON.stringify(q.options)
      };
    });

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;
    
    console.log(`Created ${data.length} sample quiz questions for notebook ${notebookId}`);
    return data;
  } catch (error) {
    console.error('Error creating sample questions:', error);
    throw error;
  }
};