import { useEffect, useState } from "react"
import { database } from "../services/firebase"
import { UseAuth } from "./useAuth"

type FirebaseQuestions = Record<string, {
    content: string,
    author: {
        name: string;
        avatar: string;
    }
    isHighLighted: boolean;
    isAnswered: boolean;
    likes: Record<string, {
        authorId: string;
    }>;
}>

type QuestionType = {
    id: string;
    content: string,
    author: {
        name: string;
        avatar: string;
    }
    isHighLighted: boolean;
    isAnswered: boolean;
    likeCount: number;
    likeId: string | undefined;
}

export function useRoom(roomId: string) {
    const { user } = UseAuth();
    const [questions, setQuestions] = useState<QuestionType[]>([])
    const [title, setTitle] = useState('')

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomId}`)
        roomRef.on('value', room => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};
            const parsedQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighLighted: value.isHighLighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeId: Object.entries(value.likes ?? {}).find(([key, likes]) => likes.authorId === user?.id)?.[0],
                }
            })
            setTitle(databaseRoom.title)
            setQuestions(parsedQuestions)
        })

        return () => {
            roomRef.off('value');
        }
    }, [roomId, user?.id])

    return { questions, title }
}