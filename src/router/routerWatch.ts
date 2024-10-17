import router from "./router";

function hasLogin(){
    const token = localStorage.getItem('access_token') || localStorage.getItem('refresh_token')
    return token !== null || token !== ''
}

router.beforeEach((to,from)=>{
    const t = to.fullPath
    const hasl = hasLogin()
    
    if( hasl && t !=='/login'){
        return {name:'login'}
    }
    
    return true;
})

export default router;