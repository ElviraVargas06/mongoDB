

export const generateOTP = () =>{
    const expiresIn = 60 * 15;

        try {
            let otp = ''
                for (let i = 0; i <= 3; i++){
                    const randVal = Math.round(Math.random() * 9)
                        otp = otp + randVal
                }    
            return {otp, expiresIn};
            
        } catch (error) {
            console.log(error);
        }
}

