'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const rawUserId = formData.get('userId') as string;
    const email = rawUserId.includes('@') ? rawUserId : `${rawUserId.toLowerCase().replace(/\s+/g, '_')}@eiger.com`;

    // type-casting here for simplicity
    const data = {
        email: email,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
