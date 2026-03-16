module.exports = {
    
    rgb(hex) {

        if(hex.charAt(0)=="#") hex = hex.slice(1); // Chops off #

        return [
            parseInt(hex.charAt(0)+hex.charAt(1),16),
            parseInt(hex.charAt(2)+hex.charAt(3),16),
            parseInt(hex.charAt(4)+hex.charAt(5),16)
        ];
        
    }

}