## NODEJS COMPANY RESEARCHER

1. Install dependencies. `yarn install` or `npm install`.
2. Create a `.env` file in the root directory.
3. Copy the content of `.env.sample` to the `.env` and add your API key
4. You can run the script by
```
// Using the sample files
node index ./synot.pdf
// or
node index ./clyde.pdf

// Using your another PDF
node index /path/to/file

```
Sample Response
```
Extracted details {
    company_name: 'SYNOT Group',
    location: '4000 Limassol, Cyprus',
    website: 'www.bmw-synotauto.cz',
    email: 'nadacesynot.cz',
    desc: 'business in more than twenty countries all over the world',  
    industry: 'GAMING INDUSTRY',
    founded: '1991',
    revenue: '2016 EUR   584  million',
    employees: 'three',
    competitors: 'operators and suppliers of gaming equipment',
    key_products: 'online casino, online poker  and virtual sports',    
    recent_news: 'The Group is planning to expand to other  countries and continents in the future',
    social_media: 'SYNOT Group',
    partnerships: 'international business relationships',
    challenges: 'The Group is planning to expand to other  countries and continents in the future',
    future_plans: 'The Group is planning to expand to other  countries and continents'
}
```