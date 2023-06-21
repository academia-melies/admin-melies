import { Box } from '../atoms'
import { useAppContext } from '../context/AppContext'
import { ProtectRoute } from '../context/ProtectRoute'
import { Colors, LeftMenu, UserHeader } from '../organisms'
import { menuItems } from '../permissions'


const PagesRoute = ({ Component, pageProps }) => {

    const { colorPalette } = useAppContext()

    return (
        <ProtectRoute>
            <Box sx={styles.bodyContainer}>
                <LeftMenu menuItems={menuItems} />
                <UserHeader />
                <Box sx={{ ...styles.contentContainer, backgroundColor: colorPalette.primary, transition: 'background-color 1s'}}>
                    <Component {...pageProps} />
                </Box>
            </Box>
        </ProtectRoute>
    )
}

const styles = {
    bodyContainer: {
        display: "flex",
        minHeight: "100vh",
        flexDirection: "row",
        width: '100%',
    },
    contentContainer: {
        display: "flex",
        width: '100%',
        flexDirection: 'column',
        flex: 1,
        gap: `35px`,
        // backgroundColor: Colors.background,
        padding: { xs: `30px`, xm: `25px`, md: `120px 65px`, lg: `120px 65px` },
        paddingBottom: `60px`,
        overflowY: 'hidden',
        marginTop: { xs: `60px`, xm: `0px`, md: `0px`, lg: `0px` }
    },
}

export default PagesRoute;