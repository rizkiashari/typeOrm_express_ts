import "reflect-metadata";
import { createConnection } from "typeorm";
import express, { Request, Response } from "express";
import { validate } from "class-validator";
import { User } from "./entity/User";
import { Post } from "./entity/Post";

const app = express();
app.use(express.json());

// CREATE
app.post("/users", async (req: Request, res: Response) => {
    const { name, email, role } = req.body;
    try {
        const user = User.create({ name, email, role });
        
        const error = await validate(user);
        
        if (error.length > 0) {
            throw error;
        }

        await user.save();

        return res.status(201).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error);
    }
})

// READ
app.get("/users", async (_: Request, res: Response) => {
  
    try {
        const users = await User.find({relations: ['posts']}); 

        return res.status(201).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }
})

// UPDATE
app.put('/users/:uuid',async (req:Request, res: Response ) => {
    const uuid = req.params.uuid;

    const { name, email, role } = req.body;

    try {
        const user = await User.findOneOrFail({ uuid });

        user.name = name || user.name;
        user.role = role || user.role;
        user.email = email || user.email;

        await user.save();

        return res.status(201).json(user);
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }
})

// DELETE
app.delete('/users/:uuid',async (req:Request, res: Response ) => {
    const uuid = req.params.uuid;

    try {
        const user = await User.findOneOrFail({ uuid });

        await user.remove();

        return res.status(204).json({message: 'User Deleted Successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }
}) 

// FIND
app.get('/users/:uuid',async (req:Request, res: Response ) => {
    const uuid = req.params.uuid;

    try {
        const user = await User.findOneOrFail({ uuid });

        return res.status(200).json(user);
    } catch (error) {
        console.log(error);
        return res.status(404).send({ message: "User not found"});
    }
}) 

// CREATE POST
app.post('/posts', async (req: Request, res: Response) => {
    const { userUuid, title, body } = req.body;

    try {

        const user = await User.findOneOrFail({ uuid: userUuid });

        const post = Post.create({ title, body, user });
        
        await post.save();

        return res.status(201).json(post);
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }

})

// READ POST
app.get('/posts', async (_: Request, res: Response) => {
  
    try {

        const posts = await Post.find({ relations: ['user'] });
        
        return res.status(201).json(posts);
        
    } catch (error) {
        console.log(error);
        return res.status(500).send(error.message);
    }

})

createConnection().then(async connection => {

    app.listen(5000, () => {
        console.log("Database connection established");
    });

}).catch(error => console.log(error));
