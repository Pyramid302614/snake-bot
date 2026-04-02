// const u = require("../u");

// module.exports = {

//     newFrame(guildId) {

//         try {
            
//             if(!u.sbdb.guildExists(guildId)) return {data:"Guild does not exist.",code:-1};
//             if(!u.settings.get(guildId,"spawning.enabled")) return {data:"Spawning not enabled.",code:-1};
            
//             const frequency = 
//                 Math.max(Math.min(
//                     u.settings.get(guildId,"spawning.frequency") // Setting
//                     + ( -1 + Math.floor(Math.random() * 2)), // Variating
//                     96), // Hard coded max
//                     0 // Hard coded min
//                 )
//             ;
        
//             const duration = u.time.hours(24); // Yes it's necessary
//             const max_deviation = 0.75; // 75 percent of it's normal maximum deviation limit

//             const start = Date.now();
//             const end = start+duration;

//             var nonlinear_points = [];

//             // Map gen
//             for(let i = 0; i < frequency; i++) {

//                 // Linear point gen
//                 const linear = Math.floor(start+duration/frequency*i);

//                 // Non-linear point gen
//                 let deviation = Math.floor(duration/frequency/2*max_deviation*(-1+Math.floor(Math.random()*2)));
//                 const nonlinear = 
//                     Math.max(Math.min(
//                         linear + deviation,
//                         end), // Limits top
//                         start // Limits bottom
//                     )
//                 ;

//                 if(!nonlinear_points.includes(nonlinear)) nonlinear_points.push(nonlinear);

//             }

//             // Actual returning
//             return {
//                 data: nonlinear_points,
//                 code: 0
//             };

//         } catch(e) {

//             // Error catching
//             return {
//                 data: e,
//                 code: -2
//             };

//         }
    
//     }

// }

// console.log(require("./test.js").newFrame("1485451247753494670"));