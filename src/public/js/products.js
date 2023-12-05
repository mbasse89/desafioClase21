const socket = io()

const cart = '6567aea166d089776449df2a'
const addCart = async (productId) => {
    try {
        const res = await fetch(`/api/carts/${cart}/product/${productId}`, {
            method: 'POST',
        });
        const result = await res.json();
        if (result.status === 'error') {
            throw new Error(result.error);
        }

        // Mostrar notificación de éxito
        Toastify({
            text: 'Producto agregado al carrito exitosamente',
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: 'top',
            position: 'right',
            style: {
                background: "#7dd56f",
            },
        }).showToast();
    } catch (error) {
        console.log(error);
    }
};

const emptyCart = async () => {
    try {
        const res = await fetch(`/api/carts/${cart}`, {
            method: 'DELETE',
        })
        const result = await res.json()
        if (result.status === 'error') throw new Error(result.error)
        else socket.emit('cartList', result)

        // Mostrar notificación de éxito
        Toastify({
            text: 'Gracias por su compra',
            duration: 2000,
            newWindow: true,
            close: true,
            gravity: 'top',
            position: 'right',
            stopOnFocus: true,
            style: {
                background: "#7dd56f",
            },
            onClick: function () {},
        }).showToast()
    } catch (error) {
        console.log(error)
    }
}

const cartBody = document.querySelector('#cartBody')

socket.on('updatedCarts', (products) => {
    console.log(products.payload)
    cartBody.innerHTML = `
        <div class="text-center">
            <h2 class="p-5">Cart Empty</h2>
        </div>
    `
})