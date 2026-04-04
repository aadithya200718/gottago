import httpx
import asyncio

async def run():
    async with httpx.AsyncClient() as client:
        r = await client.post('http://127.0.0.1:8000/api/v1/workers/register', json={
            'name': 'Test User',
            'phone': '9999999999',
            'platform': 'Swiggy',
            'city': 'Mumbai',
            'zone': 'Andheri West',
            'worker_id': 'TEST_007',
            'rating': 4.5,
            'avg_weekly_hours': 40,
            'baseline_weekly_earnings': 5000
        })
        print("Status", r.status_code)
        print("Response", r.text)

if __name__ == "__main__":
    asyncio.run(run())
