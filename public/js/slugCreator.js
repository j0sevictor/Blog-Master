function alphanum(e) {
    //Regex for Valid Characters i.e. Alphabets and Numbers.
    var regex = /^[A-Za-z0-9]+$/;

    //Validate TextBox value against the Regex.
    var isValid = regex.test(e);

    return isValid;
}

function slugCreator(idPrim)
{
    document.addEventListener('DOMContentLoaded', () => {
        let tituloInput = document.querySelector(idPrim)
        let slugInput = document.querySelector('#slug')
        let slugInputHdd = document.querySelector('#slughdd')
        tituloInput.addEventListener('keyup', () => {
            let titulo = tituloInput.value
            let slug = slugInput
            let slughdd = slugInputHdd

            slug.value = ''
            titulo = titulo.trim()
            for (value of titulo){
                if (value == ' '){
                    slug.value += '-'
                } else if (alphanum(value)){
                    slug.value += value.toLowerCase()
                }
            }
            slughdd.value = slug.value
        })
    })
}