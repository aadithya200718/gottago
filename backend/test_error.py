
import sys
import asyncio
sys.path.append('.')
from routers.workers import register_worker, WorkerCreate

async def test():
    body = WorkerCreate(
        name='Test User', 
        phone='9999999999', 
        platform='Swiggy', 
        city='Mumbai', 
        zone='Dharavi', 
        worker_id='test1234', 
        rating=4.5, 
        avg_weekly_hours=40, 
        baseline_weekly_earnings=6000
    )
    try:
        res = await register_worker(body)
        print('Success:', res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())

