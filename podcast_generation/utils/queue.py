from asyncio import Queue
from typing import Dict, Any, Tuple

event_queue: Queue[Tuple[str, Dict[str, Any]]] = Queue() 