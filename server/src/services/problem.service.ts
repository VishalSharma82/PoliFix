import { supabase } from '../config/supabase';

export const getAllProblems = async () => {
    const { data, error } = await supabase.from('problems').select('*');
    if (error) throw error;
    return data;
};

export const createProblem = async (problemData: any) => {
    const { data, error } = await supabase.from('problems').insert(problemData).select();
    if (error) throw error;
    return data;
};

export const getProblemById = async (id: string) => {
    const { data, error } = await supabase.from('problems').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};
