"use client"
import supabase from '@/utils/supabaseClient';
import React, { useState } from 'react'

const page = () => {
    const [email, setEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();

    async function signUpWithEmail() {
        try{
            if(email && password){
                const resp = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                if(resp.error) throw resp.error;
                const userId = resp.data.user?.id;
                if(userId){
                    await createUser(userId);
                }
                console.log("userId ", userId)
            }
        } catch {}
    }

    async function createUser(userId: string){
        try{
            const {error} = await supabase
            .from("users")
            .insert({id: userId});
            if(error) throw error;
        }
        catch (error){
            console.log("error: ", error)
        }
    }

    return (
        <div className="flex justify-center h-screen items-center">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                    Email
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    onChange={(e)=>setEmail(e.target.value)}
                />
                <label className="block text-gray-700 text-sm font-bold mb-2 mt-4" htmlFor="password">
                    Password
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="password"
                    type="password"
                    placeholder="enter password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                type='button' 
                onClick={signUpWithEmail}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg mt-4'>
                    sign up
                </button>
            </div>
        </div>
    )
}

export default page