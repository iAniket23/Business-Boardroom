FROM python:3.11

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["python3", "app.py"]  # <-- Replace app.py with your actual script name
