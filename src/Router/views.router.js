import { Router } from 'express';
import productModel from '../DAO/models/produtcs.model.js';
import messageModel from '../DAO/models/message.model.js';
import cartModel from '../DAO/models/carts.model.js';

const router = Router();

const justPublicWitoutSession = (req,res,next) => {
    if (req.session?.user) return res.redirect("/products")
    
    return next()
  }
  
  const auth = (req,res,next) => {
    if (req.session?.user) return next()
  
    return res.redirect("/login")
  }

router.get("/products", auth, async (req, res) => {
  try {
    const { limit = 10, page = 1, sort = '', category = '', stock = '' } = req.query;

    const filter = {
      ...(category && { category }),
      ...(stock && { stock }),
    };

    let sortOptions = {};
    if (sort === 'asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'desc') {
      sortOptions = { price: -1 };
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOptions,
      lean: true,
    };

    const products = await productModel.paginate(filter, options);

    res.render('products', { products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/realTimeProducts', async (req, res) => {
  try {
    const allProducts = await productModel.find().lean().exec();
    res.render('realTimeProducts', { allProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/chat', async (req, res) => {
  try {
    const messages = await messageModel.find().lean().exec();
    res.render('chat', { messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/product/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productModel.findById(pid).lean().exec();

    if (!product) {
      return res.status(404).json({ error: 'The product does not exist' });
    }

    res.render('product', { product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findById(cid).lean().exec();

    if (!cart || !cart.products || cart.products.length === 0) {
      const emptyCart = 'Carrito Vacío';
      req.app.get('socketio').emit('updatedCarts', []);
      return res.render('carts', { emptyCart });
    }

    const carts = cart.products;
    req.app.get('socketio').emit('updatedCarts', carts);

    res.render('carts', { carts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/login", justPublicWitoutSession, (req,res) => {
    return res.render("login",{})
  })
  
  router.get("/register", justPublicWitoutSession, (req,res) => {
    return res.render("register", {})
  })

export default router;
