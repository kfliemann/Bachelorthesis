<?php
$dbConnector = new DatabaseConnector();

class DatabaseConnector
{
    private $login = "logindata.txt";
    private $servername = "localhost";
    private $username = "";
    private $password = "";
    private $dbname = "dev_hefl";
    private $conn;
    private $errorHandler;
    public $firstNames;
    public $lastNames;
    public $emailProvider;

    public function __construct()
    {
        $this->errorHandler = new ErrorHandler();

        //uncomment this, if you need to create database logindata with your credentials
        //$this->setLoginData("<USERNAME>","<PASSWORD>");

        if (!$this->isSpam()) {
            $this->getLoginData();
            $this->connectDb();
            $this->processRequest();
            $this->updateAntiSpam();
        }
    }

    public function connectDb()
    {
        try {
            $this->conn = new PDO("mysql:host=" . $this->servername . ";dbname=" . $this->dbname, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (\Throwable $th) {
            $this->errorHandler->createError($th->getMessage());
            die;
        }
    }

    public function processRequest()
    {
        echo ("--------------------------- \n");
        switch ($_POST["action"]) {
            case 'createUser':
                $this->readDummyDataFiles();
                $this->createNewUser($_POST["amount"]);
                break;
            case 'createQuestions':
                $this->createQuestionSequence($_POST);
                break;
            case 'createAnswerRun':
                $this->createAnswerSequence($_POST);
                break;
            case 'flushTables':
                $this->flushTables();
                break;
            case 'readCSV':
                $this->readCSVSequence($_POST["csvType"]);
                break;
            default:
                # code...
                break;
        }
        echo ("--------------------------- \n");
    }

    //to prevent database spam only allow button press every 10 seconds
    public function isSpam()
    {
        $antiSpam = "lastInteraction.txt";
        $currentTimestamp = time();
        $oldTimestamp = "";
        if (!file_exists($antiSpam)) {
            file_put_contents($antiSpam, $currentTimestamp);
        } else {
            $oldTimestamp = file_get_contents($antiSpam);
        }

        if ($currentTimestamp - $oldTimestamp <= 5) {
            echo ("You have to wait " . 5 - ($currentTimestamp - $oldTimestamp) . " more seconds before generating new data to prevent spam. \n");
            return true;
        } else {
            return false;
        }

    }

    public function updateAntiSpam()
    {
        $antiSpam = "lastInteraction.txt";
        $currentTimestamp = time();
        file_put_contents($antiSpam, $currentTimestamp);
    }

    public function createNewUser($amount)
    {
        for ($i = 0; $i < $amount; $i++) {
            $firstName = $this->firstNames[rand(0, count($this->firstNames) - 1)];
            $lastName = $this->lastNames[rand(0, count($this->lastNames) - 1)];
            $emailAdress = strtolower($firstName) . "." . strtolower($lastName) . $this->emailProvider[rand(0, count($this->emailProvider) - 1)];
            $password = $this->generateRandomString();
            $globalRole = "STUDENT";
            $currentconceptNodeId = rand(1, 15);
            $skilllevel = rand(10, 100);

            $sql = "INSERT INTO `User`
            (`email`,`firstname`,`lastname`,`password`,`globalRole`,`currentconceptNodeId`, `skillLevel`)
            VALUES
            (?, ?, ?, ?, ?, ?, ?)";
            $arr = [$emailAdress, $firstName, $lastName, $password, $globalRole, $currentconceptNodeId, $skilllevel];
            $this->insertStatement($sql, $arr);

        }
        if ($amount == 1) {
            echo ("The insert was successful. $amount new entry created. \n");
        } else {
            echo ("The insert was successful. $amount new entries created. \n");
        }

    }

    public function createQuestionSequence($userInput)
    {
        $baseString = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo";
        for ($i = 0; $i < $userInput["questionAmount"]; $i++) {
            switch ($userInput["questionType"]) {
                case 'multipleChoice':
                    $name = "name: " . substr($baseString, 0, rand(20, 35));
                    $description = "description: " . substr($baseString, 0, rand(50, 170));
                    $text = "text: " . substr($baseString, 0, rand(50, 180));
                    $type = "MC";
                    $score = rand(1, 30);
                    $conceptNodeId = rand(1, 108);
                    while ($score % $userInput["correctAnswerAmount"] !== 0) {
                        $score = rand(1, 30);
                    }
                    break;
                case 'singleChoice':
                    $name = "name: " . substr($baseString, 0, rand(20, 35));
                    $description = "description: " . substr($baseString, 0, rand(50, 170));
                    $text = "text: " . substr($baseString, 0, rand(50, 180));
                    $type = "SC";
                    $score = rand(1, 10);
                    $conceptNodeId = rand(1, 108);
                    break;
                default:
                    # code...
                    break;
            }
            $authorId = "1";

            $sql = "SELECT MAX(id)+1 as id FROM Question;";
            $questionId = ($this->selectStatement($sql)[0]["id"] !== null) ? $this->selectStatement($sql)[0]["id"] : 1;

            $sql = "INSERT INTO Question (updatedAt, name, description, text, score, type, authorId, contentElementId, conceptNodeId)
            VALUES (
                NOW(3), CONCAT(?, ?), ?, ?, ?, ?, ?, NULL, ?
            );";
            $arr = [$name, $questionId, $description, $text, $score, $type, $authorId, $conceptNodeId];
            $this->insertStatement($sql, $arr);

            $this->createQuestionVersion($questionId);

            $this->createMCQuestion($type, $questionId);

            switch ($userInput["questionType"]) {
                case 'multipleChoice':
                    $this->createMCOption($questionId, $userInput["answerAmount"], $userInput["correctAnswerAmount"]);
                    break;
                case 'singleChoice':
                    $this->createMCOption($questionId, $userInput["answerAmount"], NULL);
                    break;
                default:
                    # code...
                    break;
            }
        }
        echo ($userInput["questionAmount"] . " new Question(s) created. ");
        echo ($userInput["answerAmount"] . " new answer(s) created. ");

        if (array_key_exists("correctAnswerAmount", $userInput)) {
            echo ($userInput["correctAnswerAmount"] . " correct answer(s) created. \n");
        } else {
            echo ("One correct answer created. \n");
        }
    }

    public function createQuestionVersion($questionId, $isCsv = null)
    {
        if ($isCsv !== null) {
            $sql = "INSERT INTO QuestionVersion (updatedAt, questionId, successorId, version, isApproved)
            VALUES (
                NOW(3), ?, NULL, 1, 1
            );";
        } else {
            $sql = "INSERT INTO QuestionVersion (updatedAt, questionId, successorId, version, isApproved)
            VALUES (
                NOW(3), ?, NULL, 1, 1
            );";
        }

        $arr = [$questionId];
        $this->insertStatement($sql, $arr);
    }

    public function createMCOption($questionId, $amount, $correct)
    {
        $baseString = "Lorem ipsum dolor sit amet, consetetur sadipscing e";
        for ($i = 0; $i < $amount; $i++) {
            $text = substr($baseString, 0, rand(25, 50));
            switch ($correct) {
                case NULL:
                    if ($i == 0) {
                        $is_correct = 1;
                    } else {
                        $is_correct = 0;
                    }
                    break;
                default:
                    if ($correct > 0) {
                        $is_correct = 1;
                        $correct--;
                    } else {
                        $is_correct = 0;
                    }
                    break;
            }

            $sql = "SELECT MAX(id)+1 as id FROM MCOption;";
            $mcAnswerId = ($this->selectStatement($sql)[0]["id"] !== null) ? $this->selectStatement($sql)[0]["id"] : 1;

            $sql = "INSERT INTO MCOption (updatedAt, text, is_correct)
            VALUES (
                NOW(3), CONCAT(?, ?), ?
            );";
            $arr = [$text, $mcAnswerId, $is_correct];
            $this->insertStatement($sql, $arr);

            $this->createMCQuestionOption($questionId);
        }
    }

    public function createMCOptionCsv($questionId, $options)
    {
        for ($i = 0; $i < count($options); $i++) {
            $text = $options[$i][0];
            $is_correct = $options[$i][1];

            $sql = "SELECT MAX(id)+1 as id FROM MCOption;";
            $mcAnswerId = ($this->selectStatement($sql)[0]["id"] !== null) ? $this->selectStatement($sql)[0]["id"] : 1;

            $sql = "INSERT INTO MCOption (updatedAt, text, is_correct)
            VALUES (
                NOW(3), ?, ?
            );";
            $arr = [$text, $is_correct];
            $this->insertStatement($sql, $arr);

            $this->createMCQuestionOption($questionId);
        }
    }

    public function createMCQuestion($type, $questionId)
    {
        if ($type == "MC") {
            $type = 0;
        } else if ($type == "SC") {
            $type = 1;
        }
        $sql = "SELECT id INTO @id FROM QuestionVersion WHERE QuestionVersion.questionId = ?;
        INSERT INTO MCQuestion (updatedAt, questionVersionId, isSC)
        VALUES (
            NOW(3), @id, ?
        );";
        $arr = [$questionId, $type];
        $this->insertStatement($sql, $arr);
    }

    public function createMCQuestionOption($questionId)
    {
        $sql = "SELECT QuestionVersion.id INTO @QuestionVersionId FROM MCQuestion LEFT JOIN QuestionVersion ON QuestionVersion.id = MCQuestion.questionVersionId WHERE QuestionVersion.questionId = ?;
        SELECT MAX(id) INTO @MCOptionId FROM MCOption;
        INSERT INTO MCQuestionOption (updatedAt, mcQuestionId, mcOptionId)
        VALUES (
            NOW(3), @QuestionVersionId, @MCOptionId
        );";
        $arr = [$questionId];
        $this->insertStatement($sql, $arr);
    }

    public function createAnswerSequence($userInput)
    {
        $questions = $this->getQuestionIds($userInput["questionAmount"]);

        if (count($questions) > 0) {
            $users = $this->getUserIds($userInput["peopleAmount"]);
            $this->answerQuestions($userInput["runs"], $questions, $users);
        } else {
            echo ("No questions found! Try generating questions first. \n");
        }
    }

    public function getQuestionIds($amount)
    {
        $sql = "SELECT COUNT(id) as numberOfEntries FROM Question";
        $amountOfQuestions = $this->selectStatement($sql)[0]["numberOfEntries"];

        if ($amountOfQuestions < $amount) {
            $amount = $amountOfQuestions;
        }

        $sql = "SELECT sub_query.id, sub_query.type, sub_query.score
        FROM (SELECT QV.id, QV.questionId, QV.version AS max_version, Q.type, Q.score
            FROM QuestionVersion AS QV
            JOIN (
                SELECT questionId, MAX(version) AS max_version
                FROM QuestionVersion
                WHERE isApproved = 1
                GROUP BY questionId
            ) AS MaxVersions
            ON QV.questionId = MaxVersions.questionId AND QV.version = MaxVersions.max_version
            LEFT JOIN Question AS Q ON Q.id = QV.questionId) AS sub_query
        ORDER BY RAND()
        LIMIT $amount";

        return $this->selectStatement($sql);
    }

    public function getUserIds($amount)
    {
        $sql = "SELECT COUNT(id) as numberOfEntries FROM User";
        $amountOfUsers = $this->selectStatement($sql);

        if ($amountOfUsers < $amount) {
            $amount = $amountOfUsers;
        }

        $sql = "SELECT DISTINCT User.*
        FROM User
        ORDER BY RAND()
        LIMIT $amount;";

        return $this->selectStatement($sql);
    }

    public function answerQuestions($runs, $questions, $users)
    {
        $questionAnswered = 0;
        for ($i = 0; $i < $runs; $i++) {
            for ($j = 0; $j < count($questions); $j++) {
                $answersArr = $this->getAnswerId($questions[$j]["id"]);
                $optionScore = $questions[$j]["score"] / count($answersArr);
                for ($k = 0; $k < count($users); $k++) {
                    shuffle($answersArr);
                    $questionAnswered++;
                    switch ($questions[$j]["type"]) {
                        case 'MC':
                            $sql = "INSERT INTO UserMCAnswer (updatedAt, userId, mcQuestionId, pointsScored)
                                        VALUES (NOW(3), ?, ?, 0); ";
                            $arr = [$users[$k]["id"], $questions[$j]["id"]];
                            $this->insertStatement($sql, $arr);

                            $sql = "SELECT MAX(id) as id FROM UserMCAnswer";
                            $currentUserMcAnswerId = $this->selectStatement($sql)[0]["id"];

                            $answersGiven = 0;
                            $givenAnswers = [];
                            foreach ($answersArr as $key => $answer) {
                                $answerThreshold = rand(1, 100);
                                $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                $arr = [$currentUserMcAnswerId, $answer["id"]];
                                if ($answer["is_correct"] == 1) {
                                    $correctAnswer = $answer;
                                    if ($users[$k]["skillLevel"] >= $answerThreshold) {
                                        $answersGiven++;
                                        array_push($givenAnswers, $answer["id"]);
                                        $this->insertStatement($sql, $arr);
                                    }
                                } else {
                                    $wrongAnswer = $answer;
                                    if ($users[$k]["skillLevel"] < $answerThreshold) {
                                        $answersGiven++;
                                        array_push($givenAnswers, $answer["id"]);
                                        $this->insertStatement($sql, $arr);
                                    }
                                }
                            }

                            if ($answersGiven == 0) {
                                $lastChance = rand(1, 100);
                                if ($users[$k]["skillLevel"] >= $lastChance) {
                                    $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                    $arr = [$currentUserMcAnswerId, $correctAnswer["id"]];
                                    array_push($givenAnswers, $answer["id"]);
                                    $this->insertStatement($sql, $arr);
                                } else {
                                    $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                    $arr = [$currentUserMcAnswerId, $wrongAnswer["id"]];
                                    array_push($givenAnswers, $answer["id"]);
                                    $this->insertStatement($sql, $arr);
                                }
                            }

                            $this->checkIfCorrect($currentUserMcAnswerId, $questions[$j]["type"], $answersArr, $givenAnswers, $optionScore);
                            break;
                        case 'SC':
                            $optionScore = $questions[$j]["score"];

                            $sql = "INSERT INTO UserMCAnswer (updatedAt, userId, mcQuestionId, pointsScored)
                                        VALUES (NOW(3), ?, ?, 0); ";
                            $arr = [$users[$k]["id"], $questions[$j]["id"]];
                            $this->insertStatement($sql, $arr);

                            $sql = "SELECT MAX(id) as id FROM UserMCAnswer";
                            $currentUserMcAnswerId = $this->selectStatement($sql)[0]["id"];

                            $answersGiven = 0;
                            $givenAnswers = [];
                            foreach ($answersArr as $key => $answer) {
                                $answerThreshold = rand(1, 100);
                                $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                $arr = [$currentUserMcAnswerId, $answer["id"]];
                                if ($answer["is_correct"] == 1) {
                                    $correctAnswer = $answer;
                                    if ($users[$k]["skillLevel"] >= $answerThreshold) {
                                        $answersGiven++;
                                        array_push($givenAnswers, $answer["id"]);
                                        $this->insertStatement($sql, $arr);
                                        break;
                                    }
                                } else {
                                    $wrongAnswer = $answer;
                                    if ($users[$k]["skillLevel"] < $answerThreshold) {
                                        $answersGiven++;
                                        array_push($givenAnswers, $answer["id"]);
                                        $this->insertStatement($sql, $arr);
                                        break;
                                    }
                                }
                            }

                            if ($answersGiven == 0) {
                                $lastChance = rand(1, 100);
                                if ($users[$k]["skillLevel"] >= $lastChance) {
                                    $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                    $arr = [$currentUserMcAnswerId, $correctAnswer["id"]];
                                    array_push($givenAnswers, $correctAnswer["id"]);
                                    $this->insertStatement($sql, $arr);
                                } else {
                                    $sql = "INSERT INTO UserMCOptionSelected (updatedAt, userMCAnswerId, mcOptionId)
                                VALUES (NOW(3), ?, ?); ";
                                    $arr = [$currentUserMcAnswerId, $wrongAnswer["id"]];
                                    array_push($givenAnswers, $wrongAnswer["id"]);
                                    $this->insertStatement($sql, $arr);
                                }
                            }

                            $this->checkIfCorrect($currentUserMcAnswerId, $questions[$j]["type"], $answersArr, $givenAnswers, $optionScore);
                            break;
                        default:
                            # code...
                            break;
                    }
                }
            }
        }

        echo (count($users) . " person(s) has/have answered " . count($questions) . " questions in " . $runs . " runs." . "\n");
    }

    public function getAnswerId($questionId)
    {
        $sql = "SELECT MCQuestion.isSC, MCOption.*
        FROM MCQuestion
        LEFT JOIN MCQuestionOption ON MCQuestionOption.mcQuestionId = MCQuestion.id
        LEFT JOIN MCOption ON MCOption.id = MCQuestionOption.mcOptionId
        WHERE MCQuestion.questionVersionId = $questionId;";

        return $this->selectStatement($sql);
    }

    public function checkIfCorrect($currentUserMcAnswerId, $type, $allOptions, $userOptions, $optionScore)
    {

        switch ($type) {
            case 'MC':
                $pointsScored = 0;
                $isCorrect = 0;
                for ($i = 0; $i < count($allOptions); $i++) {
                    if (in_array($allOptions[$i]["id"], $userOptions) && $allOptions[$i]["is_correct"] == 1) {
                        $pointsScored += $optionScore;
                    } else if (!in_array($allOptions[$i]["id"], $userOptions) && $allOptions[$i]["is_correct"] == 0) {
                        $pointsScored += $optionScore;
                    }
                }
                if ($pointsScored == (count($allOptions) * $optionScore)) {
                    $isCorrect = 1;
                }
                $sql = "UPDATE UserMCAnswer SET pointsScored = ?, isCorrectAnswer = ? WHERE UserMCAnswer.id = ?";
                $arr = [$pointsScored, $isCorrect, $currentUserMcAnswerId];
                $this->insertStatement($sql, $arr);
                break;
            case 'SC':
                $pointsScored = 0;
                $isCorrect = 0;
                for ($i = 0; $i < count($allOptions); $i++) {
                    if (in_array($allOptions[$i]["id"], $userOptions) && $allOptions[$i]["is_correct"] == 1) {
                        $pointsScored += $optionScore;
                        $isCorrect = 1;
                    }
                }

                $sql = "UPDATE UserMCAnswer SET pointsScored = ?, isCorrectAnswer = ? WHERE UserMCAnswer.id = ?";
                $arr = [$pointsScored, $isCorrect, $currentUserMcAnswerId];
                $this->insertStatement($sql, $arr);
                break;
            default:
                # code...
                break;
        }

    }

    public function flushTables()
    {
        //TODO: currently not working due to foreign key checks
        echo ("Currently not working.");
        die;/*
    $sql = "SET FOREIGN_KEY_CHECKS = 0;
    TRUNCATE TABLE Question;
    SET FOREIGN_KEY_CHECKS = 1;";
    $stmt = $this->conn->prepare($sql);
    $stmt->execute();
    $stmt->closeCursor();
    echo ("Tables truncated \n");
    */
    }

    public function readCSVSequence($csvType)
    {
        $csvData = $this->readCSV($csvType);
        $csvData = $this->refactorCsvData($csvData);
        $this->createQuestionSequenceCsv($csvType, $csvData);
        echo ($csvType . " csv was successfully imported. \n");
    }

    public function readCSV($csvType)
    {
        $csvDataArray = [];
        $folderPath = dirname(__DIR__) . "/hefl-main/server_nestjs/src/storage/";
        switch ($csvType) {
            case 'multipleChoice':
                //TODO: adjust multiple choice
                echo ("Multiple Choice not supported yet");
                die;
                break;
            case 'singleChoice':
                $filePath = $folderPath . "Java_Fragen_Kompetenzraster_SC.csv";
                $file = fopen($filePath, 'r');
                if ($file !== false) {
                    while (($data = fgetcsv($file, 0, "|")) !== false) {
                        array_push($csvDataArray, $data);
                    }
                    fclose($file);
                }
                break;
            default:
                # code...
                break;
        }
        return $csvDataArray;
    }

    public function createQuestionSequenceCsv($csvType, $csvData)
    {
        $baseString = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo";
        for ($i = 1; $i < count($csvData); $i++) {
            switch ($csvType) {
                case 'multipleChoice':
                    //TODO: cover this case
                    echo ("Multiplechoice is currently not supported");
                    die;
                    break;
                case 'singleChoice':
                    $name = "name: " . substr($baseString, 0, rand(20, 35));
                    $description = "descr: " . substr($baseString, 0, rand(50, 180));
                    $text = $csvData[$i][1];
                    $type = "SC";
                    $score = rand(1, 10);
                    $conceptNodeId = $csvData[$i][0];
                    break;
                default:
                    # code...
                    break;
            }
            $authorId = "1";

            $sql = "SELECT MAX(id)+1 as id FROM Question;";
            $questionId = ($this->selectStatement($sql)[0]["id"] !== null) ? $this->selectStatement($sql)[0]["id"] : 1;

            $sql = "INSERT INTO Question (updatedAt, name, description, text, score, type, authorId, contentElementId, conceptNodeId)
            VALUES (
                NOW(3), CONCAT(?, ?), ?, ?, ?, ?, ?, NULL, ?
            );";

            $arr = [$name, $questionId, $description, $text, $score, $type, $authorId, $conceptNodeId];
            $this->insertStatement($sql, $arr);

            $this->createQuestionVersion($questionId, true);

            $this->createMCQuestion($type, $questionId);


            //TODO: split answers from main array, refactor it to have 2 dimensional array optiontext, isCorrect
            switch ($csvType) {
                case 'multipleChoice':
                    $this->createMCOption($questionId, ["answerAmount"], ["correctAnswerAmount"]);
                    break;
                case 'singleChoice':
                    $this->createMCOptionCsv($questionId, $csvData[$i]["options"]);
                    break;
                default:
                    # code...
                    break;
            }
        }


    }

    public function refactorCsvData($csvData)
    {
        $optionArray = [];

        for ($i = 1; $i < count($csvData); $i++) {
            $slicedArray = array_slice($csvData[$i], 2);
            $csvData[$i] = array_slice($csvData[$i], 0, 2);

            $temp = [];
            $counter = 0;
            for ($j = 0; $j < count($slicedArray); $j++) {
                array_push($temp, $slicedArray[$j]);
                if ($counter == 1) {
                    array_push($optionArray, $temp);

                    $temp = [];
                    $counter = 0;
                } else {
                    $counter++;
                }
            }
            $csvData[$i]["options"] = $optionArray;
            $optionArray = [];
        }

        return $csvData;
    }

    public function selectStatement($sql)
    {
        $stmt = $this->conn->prepare($sql);
        try {
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            return $result;
        } catch (\Throwable $th) {
            $this->errorHandler->createError($th->getMessage());
            die;
        }
    }

    public function insertStatement($sql, $arr)
    {
        $stmt = $this->conn->prepare($sql);
        try {
            $stmt->execute($arr);
            $stmt->closeCursor();
        } catch (\Throwable $th) {
            $this->errorHandler->createError($th->getMessage());
            die;
        }
    }

    private function generateRandomString($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[random_int(0, $charactersLength - 1)];
        }
        return $randomString;
    }

    //add more dummydata which can be read from file
    //add public class variable, entry in fileNames and case in switch with key from fileNames
    public function readDummyDataFiles()
    {
        $this->firstNames = "";
        $this->lastNames = "";
        $this->emailProvider = "";

        $fileNames = array(
            "firstNames" => "first-names.json",
            "lastNames" => "last-names.json",
            "emailProvider" => "email-provider.json"
        );

        foreach ($fileNames as $key => $value) {
            $path = __DIR__ . "/dummydata/" . $value;
            if (!file_exists($path)) {
                $this->errorHandler->createError($value . " file not found!");
                die;
            } else {
                $jsonData = json_decode(file_get_contents($path));
                switch ($key) {
                    case 'firstNames':
                        $this->firstNames = $jsonData;
                        break;
                    case 'lastNames':
                        $this->lastNames = $jsonData;
                        break;
                    case 'emailProvider':
                        $this->emailProvider = $jsonData;
                        break;
                    default:
                        # hopefully you wont end up here
                        break;
                }
            }
        }
    }

    //get logindata from file (little bit more secure than saving plain data on github)
    public function getLoginData()
    {
        if (!file_exists($this->login)) {
            $this->errorHandler->createError("Login data file not found! Make sure you have a serialized version on the server.");
            die;
        } else {
            $loginData = unserialize(file_get_contents($this->login));
            $this->username = $loginData["username"];
            $this->password = $loginData["password"];
        }
    }

    //bypass pushing username and password of database to github
    public function setLoginData($username, $password)
    {
        $arr["username"] = $username;
        $arr["password"] = $password;
        $serializedArr = serialize($arr);
        file_put_contents($this->login, $serializedArr);
    }
}


class ErrorHandler
{

    private $filename = "";
    private $folderName = "dataCreator-log";
    private $filePath = "";

    public function __construct()
    {

        $this->filename = "dC_log_" . date("d.m.Y") . ".txt";
        $this->filePath = $this->folderName . "/" . $this->filename;

        //check for folder
        if (!is_dir($this->folderName)) {
            mkdir($this->folderName);
        }
        //create log file for current day
        if (!file_exists($this->folderName . "/" . $this->filename)) {
            $handle = fopen($this->folderName . "/" . $this->filename, "w");
            fclose($handle);
        }
    }

    public function createError($errorMessage)
    {
        file_put_contents($this->filePath, date('H:i:s') . " -> \t" . $errorMessage . "\n", FILE_APPEND | LOCK_EX);
        echo $errorMessage;
    }
}