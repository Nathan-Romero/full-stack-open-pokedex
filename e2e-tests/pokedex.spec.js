const { test, describe, expect } = require('@playwright/test')

describe('Pokedex', () => {
  test('front page can be opened', async ({ page }) => {
    // Mock the Pokemon API response
    await page.route('**/api/v2/pokemon/**', async route => {
      if (route.request().url().includes('limit=50')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              { url: 'https://pokeapi.co/api/v2/pokemon/1/', name: 'bulbasaur' },
              { url: 'https://pokeapi.co/api/v2/pokemon/2/', name: 'ivysaur' }
            ]
          })
        })
      }
    })

    await page.goto('', { timeout: 30000 })
    await expect(page.getByText('ivysaur')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Pokémon and Pokémon character names are trademarks of Nintendo.')).toBeVisible()
  })

  test('pokemon page can be navigated to', async ({ page }) => {
    // Mock both the list API and the individual Pokemon API
    await page.route('**/api/v2/pokemon/**', async route => {
      if (route.request().url().includes('limit=50')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              { url: 'https://pokeapi.co/api/v2/pokemon/1/', name: 'bulbasaur' },
              { url: 'https://pokeapi.co/api/v2/pokemon/2/', name: 'ivysaur' }
            ]
          })
        })
      } else if (route.request().url().includes('ivysaur')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            abilities: [{ ability: { name: 'chlorophyll' }, is_hidden: false }],
            types: [{ slot: 1, type: { name: 'grass' } }],
            stats: [],
            sprites: { front_default: 'test.png' }
          })
        })
      }
    })

    // Start from the homepage (which works with your current server setup)
    await page.goto('', { timeout: 30000 })

    // Wait for the pokemon list to load
    await expect(page.getByText('ivysaur')).toBeVisible({ timeout: 15000 })

    // Click on the ivysaur link to navigate to its page
    await page.getByText('ivysaur').click()

    // Wait for navigation and check for ivysaur's ability
    await expect(page.getByText('chlorophyll')).toBeVisible({ timeout: 15000 })
  })
})