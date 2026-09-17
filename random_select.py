import csv
import random

# CSV에서 곡명 읽기
with open("song.csv", "r", encoding="utf-8-sig", newline="") as file:
    reader = csv.DictReader(file)
    songs = [row["곡명"] for row in reader if row["곡명"]]

while True:
    command = input("\n1: 랜덤 곡 3개 뽑기 / 0: 종료\n> ").strip()

    if command == "0":
        print("종료합니다.")
        break

    elif command == "1":
        selected = random.sample(songs, 3)

        print("\n=== 랜덤 곡 3개 ===")
        for i, song in enumerate(selected, start=1):
            print(f"{i}. {song}")

    else:
        print("1 또는 0을 입력해주세요.")
