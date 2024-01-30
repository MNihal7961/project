const global=require('../global/globalfunction')
const bannerHelper=require('../helper/bannerhelpers')

const adminBanner_get=async(req,res)=>{
    try{
        const title="Banner"
        const bannerData=await global.findBanner()
        res.render('admin-bannar',{title,bannerData})
    }catch(err){
        console.error(err)
        res.status(500).render('500')
    }
}

const adminAddBanner_post=async(req,res)=>{
    try{
        const {title,description}=req.body
        console.log(req.file.filename)
        const update=await bannerHelper.addBanner(title,description,req.file.filename)
        res.redirect('/admin/banner?message=success')
    }catch(err){
        console.error(err)
    }
}

const adminRemoveBanner_delete=async(req,res)=>{
    try{
        const id=req.params.id
        const update=await bannerHelper.removeBanner(id)
        res.json({success:true})
    }catch(err){
        console.error(err)
        res.status(500).render('500')
    }
}

const adminEditBanner_post=async(req,res)=>{
    try{

    }catch(err){
        console.error(err)
        res.status(500).render('500')
    }
}
module.exports={
    adminBanner_get,
    adminAddBanner_post,
    adminRemoveBanner_delete,
    adminEditBanner_post
}