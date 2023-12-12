import { Router } from 'express';
import productModel from '../DAO/models/produtcs.model.js';
import cartModel from '../DAO/models/carts.model.js';

const router = Router();

router.post('/', async (req, res) => {
    try {
        const cartData = req.body;
        const newCart = await cartModel.create(cartData);
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const quantity = req.body.quantity || 1;

        // Validar la cantidad
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un entero positivo' });
        }

        const product = await productModel.findById(pid);
        const cart = await cartModel.findById(cid);

        if (!product || !cart) {
            return res.status(404).json({ error: 'Producto o carrito no válido' });
        }

        const existingProductIndex = cart.products.findIndex(item => item.product.equals(pid));

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }

        const updatedCart = await cart.save();
        res.json({ status: 'success', payload: updatedCart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/carts/:cid/add/:pid', async (req, res) => {
    try {
      const { cid, pid } = req.params;
      
      const cart = await cartModel.findById(cid);
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no válido' });
      }
  
      const product = await productModel.findById(pid);
      if (!product) {
        return res.status(404).json({ error: 'Producto no válido' });
      }
  
      // Agregar lógica para añadir el producto al carrito aquí
  
      const existingProduct = cart.products.findIndex((item) => item.product.equals(pid));
      if (existingProduct !== -1) {
        cart.products[existingProduct].quantity += 1;
      } else {
        const newProduct = {
          product: pid,
          quantity: 1,
        };
        cart.products.push(newProduct);
      }
  
      const result = await cart.save();
      
      // Emitir el evento de actualización del carrito a través de Socket.IO
      req.app.get('socketio').emit('updatedCarts', result.products);
  
      res.status(200).json({ status: 'success', payload: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });

router.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: `El carrito con ID ${cid} no existe` });
        }
        res.status(200).json({ status: 'success', payload: cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.put('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no válido' });
        }

        const pid = req.params.pid;
        const existingProduct = cart.products.findIndex((item) => item.product.equals(pid));
        if (existingProduct === -1) {
            return res.status(404).json({ error: 'Producto no válido' });
        }

        const quantity = req.body.quantity;
        if (!Number.isInteger(quantity) || quantity < 0) {
            return res.status(400).json({ status: 'error', message: 'La cantidad debe ser un entero positivo' });
        }

        cart.products[existingProduct].quantity = quantity;

        const result = await cart.save();
        res.json({ status: 'success', payload: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.put("/:cid", async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: 'Carrito no válido' });
        }

        const products = req.body.products;
        if (!Array.isArray(products)) {
            return res.status(400).json({ status: "error", message: 'El formato del array de productos no es válido' });
        }
        cart.products = products;

        const result = await cart.save();

        const totalPages = 1;
        const prevPage = null;
        const nextPage = null;
        const page = 1;
        const hasPrevPage = false;
        const hasNextPage = false;
        const prevLink = null;
        const nextLink = null;

        res.status(200).json({
            status: 'success',
            payload: result.products,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink,
            nextLink,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartModel.findByIdAndUpdate(cid, { products: [] }, { new: true }).lean().exec();
        if (!cart) {
            return res.status(404).json({ status: 'success', message: 'Carrito no válido' });
        }
        res.status(200).json({ status: "success", payload: cart });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no válido' });
        }
        const pid = req.params.pid;

        const existingProduct = cart.products.findIndex((item) => item.product.equals(pid));
        if (existingProduct === -1) {
            return res.status(404).json({ error: 'Producto no válido' });
        }
        cart.products.splice(existingProduct, 1);
        const result = await cart.save();
        res.status(200).json({ status: "success", payload: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
});

export default router;