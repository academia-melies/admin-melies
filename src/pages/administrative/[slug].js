import { useRouter } from "next/router"
import { Forbidden } from "../../forbiddenPage/forbiddenPage"
import ListUsers from "./users";

export default function slugPage(props) {

    const router = useRouter()
    const { slug } = router.query;

    if (!slug) return <Forbidden />

    return (
        <>
            {
                slug === 'users' && <ListUsers />
            }
            <Forbidden />
        </>
    )

}
