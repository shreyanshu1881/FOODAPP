// import { initAdmin } from './admin'
const addtocart = document.querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter')

function updateCart(food) {
    axios.post('/update-cart', food).then(res => {
        cartCounter.innerText = res.data.totalQty
        console.log(res)
    })
}


addtocart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const food = JSON.parse(btn.dataset.food);
        updateCart(food);
        console.log(food);

    })
})

const alertMsg = document.querySelector('#success-alert')
if (alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 5000)
}



//admin code