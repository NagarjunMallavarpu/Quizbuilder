import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase only if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const isSupabaseConfigured = () => {
  return !!supabase;
};

// Local storage fallback helpers
const getLocalQuizzes = () => {
  return JSON.parse(localStorage.getItem('quizzes')) || [];
};

const saveLocalQuizzes = (quizzes) => {
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
};

export const quizDb = {
  isCloud() {
    return isSupabaseConfigured();
  },

  /**
   * Save a new quiz.
   */
  async createQuiz(quizData) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .insert([{
            title: quizData.title,
            description: quizData.description,
            category: quizData.category,
            time_limit: parseInt(quizData.timeLimit || 10, 10),
            questions: quizData.questions || [],
            created_by: quizData.createdBy,
            is_published: quizData.isPublished || false,
            access_code: quizData.accessCode
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Map returned db columns back to frontend quiz structure
        return {
          ...quizData,
          id: data.id,
          createdAt: data.created_at
        };
      } catch (err) {
        console.error("Supabase createQuiz failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    const localQuiz = {
      ...quizData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    const quizzes = getLocalQuizzes();
    quizzes.push(localQuiz);
    saveLocalQuizzes(quizzes);
    return localQuiz;
  },

  /**
   * Fetch all quizzes.
   */
  async getQuizzes() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(q => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.category,
          timeLimit: q.time_limit,
          questions: q.questions,
          createdBy: q.created_by,
          createdAt: q.created_at,
          isPublished: q.is_published,
          accessCode: q.access_code
        }));
      } catch (err) {
        console.error("Supabase getQuizzes failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    return getLocalQuizzes().reverse();
  },

  /**
   * Fetch a single quiz by ID.
   */
  async getQuizById(id) {
    if (isSupabaseConfigured()) {
      try {
        // IDs are bigints in Supabase, parse if necessary
        const searchId = isNaN(parseInt(id)) ? id : parseInt(id);
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', searchId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            timeLimit: data.time_limit,
            questions: data.questions,
            createdBy: data.created_by,
            createdAt: data.created_at,
            isPublished: data.is_published,
            accessCode: data.access_code
          };
        }
      } catch (err) {
        console.error("Supabase getQuizById failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    const quizzes = getLocalQuizzes();
    const idStr = id ? id.toString() : '';
    return quizzes.find(q => q.id.toString() === idStr) || null;
  },

  /**
   * Find quiz by Access Code.
   */
  async getQuizByAccessCode(code) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('access_code', code.toUpperCase().trim())
          .maybeSingle();

        if (error) throw error;

        if (data) {
          return {
            id: data.id,
            title: data.title,
            description: data.description,
            category: data.category,
            timeLimit: data.time_limit,
            questions: data.questions,
            createdBy: data.created_by,
            createdAt: data.created_at,
            isPublished: data.is_published,
            accessCode: data.access_code
          };
        }
      } catch (err) {
        console.error("Supabase getQuizByAccessCode failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    const quizzes = getLocalQuizzes();
    return quizzes.find(q => q.accessCode.toUpperCase().trim() === code.toUpperCase().trim()) || null;
  },

  /**
   * Update an existing quiz.
   */
  async updateQuiz(id, updatedFields) {
    if (isSupabaseConfigured()) {
      try {
        const searchId = isNaN(parseInt(id)) ? id : parseInt(id);
        
        // Prepare DB fields
        const dbFields = {};
        if (updatedFields.title !== undefined) dbFields.title = updatedFields.title;
        if (updatedFields.description !== undefined) dbFields.description = updatedFields.description;
        if (updatedFields.category !== undefined) dbFields.category = updatedFields.category;
        if (updatedFields.timeLimit !== undefined) dbFields.time_limit = parseInt(updatedFields.timeLimit, 10);
        if (updatedFields.questions !== undefined) dbFields.questions = updatedFields.questions;
        if (updatedFields.isPublished !== undefined) dbFields.is_published = updatedFields.isPublished;

        const { error } = await supabase
          .from('quizzes')
          .update(dbFields)
          .eq('id', searchId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase updateQuiz failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    const quizzes = getLocalQuizzes();
    const idStr = id ? id.toString() : '';
    const index = quizzes.findIndex(q => q.id.toString() === idStr);
    if (index !== -1) {
      quizzes[index] = {
        ...quizzes[index],
        ...updatedFields
      };
      saveLocalQuizzes(quizzes);
      return true;
    }
    return false;
  },

  /**
   * Delete a quiz.
   */
  async deleteQuiz(id) {
    if (isSupabaseConfigured()) {
      try {
        const searchId = isNaN(parseInt(id)) ? id : parseInt(id);
        const { error } = await supabase
          .from('quizzes')
          .delete()
          .eq('id', searchId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase deleteQuiz failed, falling back to localStorage:", err);
      }
    }

    // Local storage fallback
    const quizzes = getLocalQuizzes();
    const idStr = id ? id.toString() : '';
    const filtered = quizzes.filter(q => q.id.toString() !== idStr);
    saveLocalQuizzes(filtered);
    return true;
  }
};
