
import { verify,sign } from '@tsndr/cloudflare-worker-jwt';
import { Hono,Next } from 'hono'
import c,{Context} from "hono/jsx"
import{z} from "zod"
// import jwt,{JwtPayload} from "jsonwebtoken"
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { env } from 'hono/adapter'
const jwtpasscode="1435"
var prisma
const app = new Hono();
  type User={
    username:string,
    email:string,
    password:string
  }
//zod  validation
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

//dbmiddleware
app.use(async (c:Context,next:Next)=>{
  const { DATABASE_URL } = env<{ DATABASE_URL: string }>(c)
  
  prisma = new PrismaClient({
      datasourceUrl: DATABASE_URL,
  }).$extends(withAccelerate())
  await next();
})
//zod middleware
async function zodAuthMiddleware(c:Context,next:Next){
  var body:{
    username:string,
    email:string,
    password:string
  } =await c.req.json();
  var check= emailSchema.safeParse(body.email)
  var check1=  passwordSchema.safeParse(body.password)

  if(!(check.success&&check1.success)){
    return new Response("Invalid format of email or password")
  }
  else{
    await next()
  }
}

//signup endpoint
app.post("/signup",zodAuthMiddleware,async(c:Context)=>{
  var body:{
    username:string,
    email:string,
    password:string
  } =await c.req.json();
  
 
 
    try{
      const data = await prisma.users.findFirst({
        where:{username:body.username}
      })
        
        if(data!=null){
          return new Response("Username is already taken")
        }
        else if (data==null){
          const result = await prisma.users.create({
            data:body
          })
          return new Response("user created",{status:201})

        }
      }
        
    catch(err){
      return new Response(err,{status:500})
    }
  
})
//signin endpint
app.post("/signin",zodAuthMiddleware,async(c:Context)=>{
  var body:{
    email:string,
    password:string
  }=await c.req.json();
   var result= await prisma.users.findFirst({
    where:{email:body.email}
   })
   if(result!=null){
     var token = await sign({email:body.email},jwtpasscode);
     return new Response(token)
   }
   else{
    return new Response("Not Signed up",{status:401})
   }
})
//jet auth middleware
async function jwtAuthMiddleware(c:Context,next:Next){
  var token:string =  c.req.header("Auth");
  try{
    
    const isValid = await verify(token, jwtpasscode);
    if (!isValid) {
      return new Response('Unauthorized', { status: 401 });
    }
     await next();
  }
  catch(err){
    return new Response(err)
  }
}
//post a post 
app.post("/post",jwtAuthMiddleware,async (c:Context)=>{
  var body:{
    user_id:number,
    title:string,
    body:string
  }= await c.req.json();
  try{
    var result=await prisma.blog.create({
      data:body
    })
    return new Response(result)
  }
  catch(err){
    return new Response(err,{status:401})
  }
})
//get posts
app.get("/posts", async (c:Context)=>{
  var user_id:number= Number(c.req.header("user_id"));
  try{
    var result= await prisma.blog.findMany({
      where:{user_id}
    })
    return new Response(JSON.stringify(result));  
  }    
  catch(err){
    return new Response(err,{status:500})
  }
})
app.get("/posts/:id",jwtAuthMiddleware,async (c)=>{
  var id:number =Number( c.req.param("id"));
  try{
    var result= await prisma.blog.findFirst({
      where:{id}
    })
    return new Response(result)
  }
  catch(err){
  return new Response(err,{status:401})
  }
})
//update post
app.put("/posts/:id",jwtAuthMiddleware,async(c)=>{
  var id:number =Number( c.req.param("id"));
  var body:{
    title?:string,
    body?:string
  }=await c.req.json();
  try{
    var data = await prisma.blog.findFirst({
      where:{id},
    })
    if(body.title==null){
      var result= await prisma.blog.update({
        where:{id},
        data:{
          title:data.title,
          body:body.body
        }
      })
      return new Response("Successfully UPdated ")
    }
    
    else if ( body.body==null){
      var result= await prisma.blog.update({
        where:{id},
        data:{
          title:body.title,
          body: data.body
        }
      })
      return new Response("Successfully UPdated ")
    }
    
    else if (body.title==null&&body.body==null){
      var result= await prisma.blog.update({
        where:{id},
        data:{
          title:data.title,
          body:data.body
        }
      })
      return new Response("Successfully UPdated ")
    }
    
    else{
      var result= await prisma.blog.update({
        where:{id},
        data:{
          title:body.title,
          body:body.body
        }
      })
      return new Response("Successfully UPdated ")
    }
    }
    catch(err){
      return new Response(err,{status:401})
    }

    
})
//deleete posts
app.delete("/posts/:id",jwtAuthMiddleware,async(c:Context)=>{
  const id =Number( c.req.param("id"));
  try{
    var result = await prisma.blog.delete({
      where:{id}
    })
   return new Response ('POsts successfully deleted')
  }
  catch(err){
   return new Response(err,{status:401})
  }
})

export default app
