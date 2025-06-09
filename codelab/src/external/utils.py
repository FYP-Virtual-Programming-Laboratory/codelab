from src.external.schemas import CodeRepository


main_content = """
from src.factorial import factorial
def main():
    try:
        n = 100
        if n < 0:
            print("Please enter a non-negative integer")
            return
        result = factorial(n)
        print(f"Factorial of {n} is {result}")
    except ValueError:
        print("Please enter a valid integer")

if __name__ == "__main__":
    main()
"""

factorial_content = """
def factorial(n: int) -> int:
    '''Calculate factorial of n'''
    if n < 0:
        raise ValueError("Factorial not defined for negative numbers")
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
"""


def pull_excercise_repository(
    excercise_id: str,
    session_id: str,
) -> CodeRepository:
    """Pull the excercise repository from the code collaboration service."""

    # NOTE: for now let's just return a dummy repository
    return CodeRepository(
        path="",
        content=None,
        sub=[
            CodeRepository(
                path="main.py",
                content=main_content,
                sub=[],
            ),
            CodeRepository(
                path="src", 
                content=None,
                sub = [
                    CodeRepository(
                        path="__init__.py",
                        content="",
                        sub=[],
                    ),
                    CodeRepository(
                        path="factorial.py",
                        content=factorial_content,
                        sub=[],
                    )          
                ],
            ),
        ],
    )
