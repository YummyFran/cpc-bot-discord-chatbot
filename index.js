const { Client, IntentsBitField, Events } = require('discord.js')
const { default: OpenAI } = require('openai')
const axios = require('axios')
const jokes = require('./jokes.json')

const options = {
  method: 'GET',
  url: 'https://vinuxd.vercel.app/api/pickup',
}

const ai = new OpenAI({
    apiKey: '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'
})

const client = new Client({ 
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ] 
})

let messages = []

const phrases = [
    "I'm not of service in this particular place.",
    "I'm afraid my capabilities don't apply here.",
    "This isn't a suitable environment for my assistance.",
    "You won't find my help beneficial in this setting.",
    "I'm currently out of my element here.",
    "Sorry, but my expertise doesn't extend to this situation.",
    "You're in a zone where I can't be of use.",
    "I'm not designed for this particular space.",
    "My assistance isn't applicable in this context.",
    "I'm limited in my usefulness in this location.",
    "The chatbot is not operational right now.",
    "Unfortunately, you can't use the chatbot at the moment.",
    "The chatbot is temporarily out of service.",
    "I regret to inform you that the chatbot is not accessible.",
    "Apologies, but the chatbot is offline.",
    "The chatbot is currently undergoing maintenance and is unavailable.",
    "I'm afraid you won't be able to use the chatbot right now.",
    "Sorry, but the chatbot is not responding at the moment.",
    "The chatbot is currently disabled and cannot be used.",
    "I'm sorry, but the chatbot is only available in a specific channel.",
    "The chatbot is currently active in another channel, not here.",
    "You can access the chatbot in a different channel, not in this one.",
    "The chatbot is restricted to a specific channel and cannot be used here.",
    "Unfortunately, the chatbot is only accessible in a designated channel.",
    "You'll need to switch to the designated channel to use the chatbot.",
    "This channel doesn't support the chatbot; it's available in a different one.",
    "You can't access the chatbot here; it's exclusively for another channel.",
    "I'm not available for use in this context.",
    "My features are limited in this particular situation.",
    "This scenario isn't suitable for my assistance."
]

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)

    client.user.setPresence({
        status: 'online',
        activities: [{
            name: 'cpcask | cpcimagine',
        }]
    })
    // client.channels.cache.get('1147154803403788358').send("The only coffee i drink")
    // client.channels.cache.get('1147154803403788358').send("https://1000logos.net/wp-content/uploads/2020/09/Java-Logo.png")
    // client.channels.cache.get('1147154803403788358').send("https://scontent.fmnl17-5.fna.fbcdn.net/v/t1.6435-9/163043853_245024337292500_7344750663431902515_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=174925&_nc_ohc=cRUTSe6biLkAX8xLw9V&_nc_ht=scontent.fmnl17-5.fna&oh=00_AfBSdJXlYYq8JwbQ9OCNHMtSZbCnfpG53P8R1qJ1GvEfgw&oe=652F7A00")
})

client.on("messageCreate", async (msg) => {
    console.log(`${msg.author.tag}: ${msg}`)

    const channels = ['1147154803403788358', '1147139637459038308', '1153581232538533908']

    //If message is in different channel
    if(!channels.includes(msg.channel.id) || msg.author.bot) {
        if (msg.content.toLocaleLowerCase().startsWith('cpc'))
            msg.reply(phrases[Math.floor(Math.random() * 30)])
        return
    }

    //Use bot command only on specified channels
    //cpcask for generating text
    if (msg.content.toLocaleLowerCase().startsWith('cpcask')) {
        // if(msg.author.id == "467327476209811466") {
        //     msg.reply("Unya na'g pangutana, katug lang sa.")
        //     return
        // }
        msg.reply("bot is thinking...").then(async message => {
            const completion = await ai.chat.completions.create({
                messages: [{
                    role: 'user',
                    content: msg.content.slice('cpcask'.length).trim()
                }],
                model: 'gpt-3.5-turbo'
            }).catch(err => { 
                message.edit("Something went wrong")
            })

            const result = completion.choices[0].message.content
            message.edit(result.slice(0, 1999))
            const maxLength = 2000;
            for (let i = 2000; i < result.length; i += maxLength) {
                const chunk = result.slice(i, i + maxLength);
                msg.reply(chunk);
            }            

            return
        })
    }

    //cpcimagine for generating images
    if (msg.content.startsWith(`cpcimagine`)) {

        const prompt = msg.content.slice('cpcimagine'.length).trim();
        console.log(prompt)
        try {
          const response = await ai.images.generate({
            prompt
          })
    
          const imageUrl = response.data[0].url;
          console.log(imageUrl)
          msg.reply(imageUrl);
        } catch (error) {
          console.error('Error generating image:', error);
          msg.channel.send('An error occurred while generating the image.');
        }

        return
    }

    //cpcpul for generating random pickuplines
    if (msg.content.toLocaleLowerCase().startsWith('cpcpul')) {
        try {
            const response = await axios.request(options);
            msg.channel.send(response.data.pickup)
        } catch (error) {
            console.error(error);
        }

        return
    }

    //cpcjoke for generating random jokes
    if (msg.content.toLocaleLowerCase().startsWith('cpcjoke')) {
        try {
            const rnd = Math.ceil(Math.random() * jokes.jokes.length)
            const joke = jokes.jokes[rnd]
            msg.channel.send(joke.question)
            msg.channel.send(joke.answer)
        } catch (error) {
            console.error(error);
        }
        
        return
    }

    //new topic in cpcchat
    if (msg.content.toLocaleLowerCase().startsWith('cpcnewtopic')) {
        messages = []
        msg.reply("Forgeting previous conversation").then(message => {
            setTimeout(() => {
                msg.delete()
                message.delete()
            }, 1000)
        })
        return
    }

    //cpcchat
    if (msg.channel.id == '1153581232538533908') {
        if(msg.content.startsWith("\\")) {
            return
        }

        messages.push({
            role: 'user',
            content: msg.content
        })
        
        try {
            msg.channel.sendTyping()
            const completion = await ai.chat.completions.create({
                messages,
                model: 'gpt-3.5-turbo'
            })
    
            const result = completion.choices[0].message.content
            messages.push({
                role: 'assistant',
                content: result
            })
            // msg.channel.send(result.slice(0, 1999))
            // if(result.length > 2000) {
            //     msg.channel.send(result.slice(1999, 3999))
            // } else if(result.length > 4000) {
            //     msg.channel.send(result.slice(3999,5999))
            // } else if(result.length > 6000) {
            //     msg.channel.send(result.slice(5999,7999))
            // } else if(result.length > 8000) {
            //     msg.channel.send(result.slice(7999,9999))
            // }

            const maxLength = 2000;
            for (let i = 0; i < result.length; i += maxLength) {
                const chunk = result.slice(i, i + maxLength);
                msg.channel.send(chunk);
            }

        } catch (error) {
            console.error(error);
        }

        return
    }
})



client.login('')